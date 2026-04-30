import { NextResponse } from 'next/server'
import AIPageGeneratorService from '@/services/AIPageGeneratorService'
import DynamicPageService from '@/services/DynamicPageService'
import UserSessionService from '@/services/AuthService/UserSessionService'

// Turns "facebook-landing-page" → "Create a landing page about: facebook landing page"
// so the AI treats it as a topic, not a slug or filename.
function expandPrompt(raw: string): string {
  const looksLikeSlug = /^[a-z0-9-_]+$/.test(raw) && raw.includes('-')
  if (looksLikeSlug) {
    const readable = raw.replace(/[-_]+/g, ' ')
    return `Create a landing page about: ${readable}`
  }
  return raw
}

export async function POST(request: NextRequest) {
  try {
    await UserSessionService.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

    const body = await request.json()
    const { prompt, save = false } = body as { prompt: string; save?: boolean }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ message: 'prompt is required' }, { status: 400 })
    }

    // Expand terse slug-style prompts into a clearer instruction
    const expandedPrompt = expandPrompt(prompt.trim())
    const generated = await AIPageGeneratorService.generate(expandedPrompt)

    if (save) {
      const page = await DynamicPageService.create({
        slug: generated.slug,
        title: generated.title,
        description: generated.description,
        keywords: generated.keywords,
        sections: generated.sections,
        metadata: generated.metadata,
        isPublished: false,
      })
      return NextResponse.json({ page, generated }, { status: 201 })
    }

    return NextResponse.json({ generated })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
