import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { AIService } from '@/services/AIServices'
import { AppLanguageEnum, LANG_NAMES } from '@/types/common/I18nTypes'
import { z } from 'zod'
import type { BlockData } from '@/types/content/PageTypes'

const AiTranslateSchema = z.object({
  sourceLang: AppLanguageEnum,
  targetLang: AppLanguageEnum,
  model: z.string().min(1),
  provider: z.string().min(1),
})

const URL_PATTERN = /^https?:\/\//
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CUID_PATTERN = /^c[a-z0-9]{20,}$/
const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/
const CSS_VALUE_PATTERN = /^(oklch|hsl|rgb|rgba)\(/

function isUntranslatable(value: string): boolean {
  return (
    URL_PATTERN.test(value) ||
    UUID_PATTERN.test(value) ||
    CUID_PATTERN.test(value) ||
    HEX_COLOR_PATTERN.test(value) ||
    CSS_VALUE_PATTERN.test(value) ||
    value.trim() === ''
  )
}

function extractStrings(obj: unknown, prefix = ''): Record<string, string> {
  if (typeof obj === 'string') {
    if (!isUntranslatable(obj)) return { [prefix]: obj }
    return {}
  }
  if (Array.isArray(obj)) {
    return obj.reduce<Record<string, string>>(
      (acc, item, i) => ({ ...acc, ...extractStrings(item, `${prefix}.${i}`) }),
      {}
    )
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.entries(obj).reduce<Record<string, string>>(
      (acc, [k, v]) => ({ ...acc, ...extractStrings(v, prefix ? `${prefix}.${k}` : k) }),
      {}
    )
  }
  return {}
}

function applyStrings(obj: unknown, translations: Record<string, string>, prefix = ''): unknown {
  if (typeof obj === 'string') {
    return translations[prefix] ?? obj
  }
  if (Array.isArray(obj)) {
    return obj.map((item, i) => applyStrings(item, translations, `${prefix}.${i}`))
  }
  if (typeof obj === 'object' && obj !== null) {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [
        k,
        applyStrings(v, translations, prefix ? `${prefix}.${k}` : k),
      ])
    )
  }
  return obj
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

    const { pageId } = await params
    const body = await request.json()

    const parsed = AiTranslateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const { sourceLang, targetLang, model, provider } = parsed.data

    const page = await DynamicPageService.getById(pageId)
    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 })
    }

    // Pick source: translation for sourceLang or fallback to EN base
    let sourceTitle = page.title
    let sourceDescription = page.description ?? ''
    let sourceSections = Array.isArray(page.sections) ? (page.sections as BlockData[]) : []

    if (sourceLang !== 'en') {
      const sourceTranslation = page.translations.find((t) => t.lang === sourceLang)
      if (sourceTranslation) {
        sourceTitle = sourceTranslation.title
        sourceDescription = sourceTranslation.description ?? sourceDescription
        sourceSections = Array.isArray(sourceTranslation.sections)
          ? (sourceTranslation.sections as BlockData[])
          : sourceSections
      }
    }

    const sourceLangName = LANG_NAMES[sourceLang] ?? sourceLang
    const targetLangName = LANG_NAMES[targetLang] ?? targetLang

    const providerService = AIService.getProvider(provider)

    // Translate title + description
    const metaPrompt = `Translate the following page metadata from ${sourceLangName} to ${targetLangName}.

Return ONLY these 2 lines in exactly this format — no extra text, no JSON, no markdown:
TITLE: [translated title here]
DESCRIPTION: [translated description here]

Source:
TITLE: ${sourceTitle}
DESCRIPTION: ${sourceDescription}`

    // Extract text strings from sections
    const textMap = extractStrings(sourceSections, 'blocks')
    const hasText = Object.keys(textMap).length > 0

    const textMapPrompt = hasText
      ? `Translate the following key-value pairs from ${sourceLangName} to ${targetLangName}.
Return ONLY valid JSON with the same keys and translated values. Do NOT change keys, do NOT add or remove keys.

${JSON.stringify(textMap, null, 2)}`
      : null

    const [metaText, textMapText] = await Promise.all([
      providerService.generateText(metaPrompt, model),
      textMapPrompt ? providerService.generateText(textMapPrompt, model) : Promise.resolve(null),
    ])

    if (!metaText) {
      return NextResponse.json({ message: 'AI failed to generate metadata translation' }, { status: 422 })
    }

    // Parse metadata
    const metaLines = metaText.trim().split('\n')
    const getField = (lines: string[], label: string) => {
      const line = lines.find((l) => l.toUpperCase().startsWith(label.toUpperCase() + ':'))
      return line ? line.slice(label.length + 1).trim() : ''
    }

    const translatedTitle = getField(metaLines, 'TITLE') || sourceTitle
    const translatedDescription = getField(metaLines, 'DESCRIPTION') || sourceDescription

    // Parse and apply section text translations
    let translatedSections = sourceSections
    if (textMapText && hasText) {
      try {
        const cleaned = textMapText
          .trim()
          .replace(/^```(?:json)?\s*\n?/, '')
          .replace(/\n?```\s*$/, '')
          .trim()
        const translatedMap = JSON.parse(cleaned) as Record<string, string>
        translatedSections = applyStrings(sourceSections, translatedMap, 'blocks') as BlockData[]
      } catch {
        // If JSON parse fails, keep source sections as-is
        translatedSections = sourceSections
      }
    }

    return NextResponse.json({
      title: translatedTitle,
      description: translatedDescription,
      sections: translatedSections,
    })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
