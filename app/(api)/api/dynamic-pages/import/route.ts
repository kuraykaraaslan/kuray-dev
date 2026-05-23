import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import {
  migrateSections,
  normalizeRepeaters,
  detectSchemaVersion,
  CURRENT_SCHEMA_VERSION,
  type BlockSchemas,
} from '@/components/dynamic/migrations'
import {
  BlockDataSchema,
  DynamicPageStatusEnum,
  type BlockData,
  type DynamicPageStatus,
} from '@/types/content/PageTypes'
import { CODE_BLOCK_META } from '@/components/dynamic/utils/CodeBlocksMeta'

type ImportBody = {
  data: unknown
  /** Used as title fallback for SINGLE-page imports only. Ignored for multi-page input. */
  title?: string
  /** Used as slug fallback for SINGLE-page imports only. Ignored for multi-page input. */
  slug?: string
  fromVersion?: number
  /**
   * When true, sends the post-migration sections through the AI ai-migrate
   * service as a final safety pass. Useful for input shapes the deterministic
   * converters can't normalize (unknown block types, exotic prop shapes).
   */
  useAi?: boolean
}

type PageInput = {
  sections: unknown[]
  meta: Record<string, unknown> | null
}

type PageResult =
  | {
      status: 'created' | 'updated'
      slug: string
      title: string
      dynamicPageId: string
      sectionsCount: number
      appliedMigrations: number[]
      repeaterConversions: number
      repeaterConvertedFields: Array<{ blockType: string; propKey: string }>
      aiApplied: boolean
      translationsUpserted: number
    }
  | { status: 'failed'; slug: string; title: string; error: string }

const SLUG_REGEX = /^[a-z0-9/-]+$/

function extractSections(input: unknown): PageInput | null {
  if (Array.isArray(input)) return { sections: input, meta: null }
  if (input && typeof input === 'object') {
    const obj = input as Record<string, unknown>
    if (Array.isArray(obj.sections)) return { sections: obj.sections, meta: obj }
    if (Array.isArray(obj.blocks)) return { sections: obj.blocks, meta: obj }
  }
  return null
}

/**
 * Detect whether `input` represents multiple pages. Returns the list of raw
 * page inputs, or null if it's a single page / sections-only payload.
 */
function extractPages(input: unknown): PageInput[] | null {
  // { pages: [...] } wrapper
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    const obj = input as Record<string, unknown>
    if (Array.isArray(obj.pages)) {
      const out: PageInput[] = []
      for (const p of obj.pages) {
        const ex = extractSections(p)
        if (ex) out.push(ex)
      }
      return out.length ? out : null
    }
  }
  // Array — could be sections OR an array of pages
  if (Array.isArray(input) && input.length > 0) {
    const looksLikePages = input.every(
      (x) =>
        x &&
        typeof x === 'object' &&
        !Array.isArray(x) &&
        (Array.isArray((x as Record<string, unknown>).sections) ||
          Array.isArray((x as Record<string, unknown>).blocks)),
    )
    if (looksLikePages) {
      const out: PageInput[] = []
      for (const p of input) {
        const ex = extractSections(p)
        if (ex) out.push(ex)
      }
      return out.length ? out : null
    }
  }
  return null
}

function normalizeBlock(raw: unknown, fallbackOrder: number): BlockData | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const type = typeof r.type === 'string' ? r.type : ''
  if (!type) return null

  const id =
    typeof r.id === 'string' && r.id.length > 0
      ? r.id
      : `block-${Math.random().toString(36).slice(2, 10)}`
  const order = typeof r.order === 'number' ? r.order : fallbackOrder
  const props =
    r.props && typeof r.props === 'object' && !Array.isArray(r.props)
      ? (r.props as Record<string, unknown>)
      : {}

  const block: BlockData = { id, type, order, props }
  if (typeof r.hidden === 'boolean') block.hidden = r.hidden
  if (typeof r.label === 'string') block.label = r.label
  if (typeof r.className === 'string') block.className = r.className
  return block
}

async function processPage(
  pageInput: PageInput,
  opts: {
    fromVersion: number
    blockSchemas: BlockSchemas
    useAi: boolean
    request: NextRequest
    /** Title override — only honored in single-page mode. */
    titleOverride?: string
    /** Slug override — only honored in single-page mode. */
    slugOverride?: string
  },
): Promise<PageResult> {
  const { meta } = pageInput
  const titleFromMeta = typeof meta?.title === 'string' ? meta.title.trim() : ''
  const slugFromMeta = typeof meta?.slug === 'string' ? meta.slug.trim() : ''

  const title = (opts.titleOverride?.trim() || titleFromMeta || '').trim()
  const slug = (opts.slugOverride?.trim() || slugFromMeta || '').trim()

  if (!title) {
    return { status: 'failed', slug, title, error: 'title is required' }
  }
  if (slug && !SLUG_REGEX.test(slug)) {
    return {
      status: 'failed',
      slug,
      title,
      error: 'Slug must be lowercase letters, numbers, hyphens, or slashes',
    }
  }

  // Normalize entries → BlockData
  const normalized: BlockData[] = []
  for (let i = 0; i < pageInput.sections.length; i++) {
    const b = normalizeBlock(pageInput.sections[i], i)
    if (b) normalized.push(b)
  }
  normalized.sort((a, b) => a.order - b.order)
  normalized.forEach((b, i) => (b.order = i))

  for (const b of normalized) {
    const r = BlockDataSchema.safeParse(b)
    if (!r.success) {
      return {
        status: 'failed',
        slug,
        title,
        error: `Block "${b.type}" failed validation: ${r.error.errors[0]?.message ?? 'unknown'}`,
      }
    }
  }

  const { sections: migratedSections, appliedMigrations } = migrateSections(
    normalized,
    opts.fromVersion,
    { blockSchemas: opts.blockSchemas },
  )
  const {
    sections: postRepeaters,
    conversions: repeaterConversions,
    converted: repeaterConvertedFields,
  } = normalizeRepeaters(migratedSections, { blockSchemas: opts.blockSchemas })

  let finalSections = postRepeaters
  let aiApplied = false
  if (opts.useAi) {
    try {
      const origin = new URL(opts.request.url).origin
      const aiRes = await fetch(`${origin}/api/dynamic-pages/ai-migrate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: opts.request.headers.get('cookie') ?? '',
        },
        body: JSON.stringify({ sections: postRepeaters }),
      })
      if (aiRes.ok) {
        const aiData = (await aiRes.json()) as { sections?: BlockData[] }
        if (Array.isArray(aiData.sections)) {
          finalSections = aiData.sections
          aiApplied = true
        }
      }
    } catch (e) {
      console.warn('AI migration pass failed; using deterministic result.', e)
    }
  }

  const description = typeof meta?.description === 'string' ? meta.description : ''
  const keywords = Array.isArray(meta?.keywords)
    ? (meta!.keywords.filter((k) => typeof k === 'string') as string[])
    : []
  const statusParse = DynamicPageStatusEnum.safeParse(meta?.status)
  const status: DynamicPageStatus = statusParse.success ? statusParse.data : 'DRAFT'
  const metadata =
    meta?.metadata && typeof meta.metadata === 'object'
      ? (meta.metadata as Record<string, unknown>)
      : undefined

  // Upsert by slug — update existing page if one is already using this slug
  const existing = slug ? await DynamicPageService.getBySlug(slug) : null

  let dynamicPageId: string
  let outcome: 'created' | 'updated'
  let finalTitle: string
  let finalSlug: string

  try {
    if (existing) {
      const updated = await DynamicPageService.update(existing.dynamicPageId, {
        slug,
        title,
        description,
        keywords,
        sections: finalSections,
        metadata,
        status,
      })
      dynamicPageId = updated.dynamicPageId
      finalTitle = updated.title
      finalSlug = updated.slug
      outcome = 'updated'
    } else {
      const created = await DynamicPageService.create({
        slug,
        title,
        description,
        keywords,
        sections: finalSections,
        metadata,
        status,
      })
      dynamicPageId = created.dynamicPageId
      finalTitle = created.title
      finalSlug = created.slug
      outcome = 'created'
    }
  } catch (e: unknown) {
    return {
      status: 'failed',
      slug,
      title,
      error: e instanceof Error ? e.message : 'Unknown error',
    }
  }

  // Persist translations if the backup carries them
  let translationsUpserted = 0
  const rawTranslations = meta?.translations
  if (rawTranslations && typeof rawTranslations === 'object' && !Array.isArray(rawTranslations)) {
    for (const [lang, t] of Object.entries(rawTranslations as Record<string, unknown>)) {
      if (!t || typeof t !== 'object' || Array.isArray(t)) continue
      const tr = t as Record<string, unknown>
      const tTitle = typeof tr.title === 'string' ? tr.title : finalTitle
      const tDescription = typeof tr.description === 'string' ? tr.description : null
      const tSectionsRaw = Array.isArray(tr.sections) ? tr.sections : []

      const tNormalized: BlockData[] = []
      for (let i = 0; i < tSectionsRaw.length; i++) {
        const b = normalizeBlock(tSectionsRaw[i], i)
        if (b) tNormalized.push(b)
      }
      tNormalized.sort((a, b) => a.order - b.order)
      tNormalized.forEach((b, i) => (b.order = i))

      const { sections: tMigrated } = migrateSections(tNormalized, opts.fromVersion, {
        blockSchemas: opts.blockSchemas,
      })
      const { sections: tFinal } = normalizeRepeaters(tMigrated, { blockSchemas: opts.blockSchemas })

      try {
        await DynamicPageService.upsertTranslation(dynamicPageId, lang, {
          title: tTitle,
          description: tDescription,
          sections: tFinal,
        })
        translationsUpserted++
      } catch (e) {
        console.warn(`Failed to upsert translation ${lang} for page ${dynamicPageId}:`, e)
      }
    }
  }

  return {
    status: outcome,
    slug: finalSlug,
    title: finalTitle,
    dynamicPageId,
    sectionsCount: finalSections.length,
    appliedMigrations,
    repeaterConversions,
    repeaterConvertedFields,
    aiApplied,
    translationsUpserted,
  }
}

export async function POST(request: NextRequest) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const body = (await request.json()) as ImportBody
    if (!body || body.data === undefined) {
      return NextResponse.json({ message: 'data is required' }, { status: 400 })
    }

    // Multi-page first; fall back to single-page extraction
    const multi = extractPages(body.data)
    const pageInputs: PageInput[] = multi ?? (() => {
      const single = extractSections(body.data)
      return single ? [single] : []
    })()

    if (pageInputs.length === 0) {
      return NextResponse.json(
        { message: 'Could not find any pages or sections in the provided JSON.' },
        { status: 400 },
      )
    }

    const fromVersion =
      typeof body.fromVersion === 'number' && body.fromVersion >= 1
        ? Math.floor(body.fromVersion)
        : detectSchemaVersion(body.data)

    // Build block schema registry once for all pages
    const blockSchemas: BlockSchemas = {}
    for (const m of CODE_BLOCK_META) blockSchemas[m.type] = m.schema
    try {
      const dbBlocks = await DynamicPageBlockService.getAll()
      for (const b of dbBlocks) {
        if (!blockSchemas[b.type]) blockSchemas[b.type] = b.schema
      }
    } catch (e) {
      console.warn('Could not load DB block schemas for import; continuing with code blocks only.', e)
    }

    const isMulti = multi !== null
    const results: PageResult[] = []
    for (const pageInput of pageInputs) {
      const result = await processPage(pageInput, {
        fromVersion,
        blockSchemas,
        useAi: !!body.useAi,
        request,
        // Only apply body overrides in single-page mode
        titleOverride: isMulti ? undefined : body.title,
        slugOverride: isMulti ? undefined : body.slug,
      })
      results.push(result)
    }

    const created = results.filter((r) => r.status === 'created').length
    const updated = results.filter((r) => r.status === 'updated').length
    const failed = results.filter((r) => r.status === 'failed').length

    return NextResponse.json(
      {
        summary: {
          total: results.length,
          created,
          updated,
          failed,
          fromVersion,
          toVersion: CURRENT_SCHEMA_VERSION,
        },
        results,
      },
      { status: failed > 0 && created + updated === 0 ? 400 : 201 },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in POST /api/dynamic-pages/import:', error)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
