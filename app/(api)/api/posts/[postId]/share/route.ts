import { NextResponse } from 'next/server'
import PostService from '@/services/PostService'
import ShortLinkService from '@/services/ShortLinkService'
import PostMessages from '@/messages/PostMessages'
import { buildLangUrl } from '@/helpers/HreflangHelper'
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, type AppLanguage } from '@/types/common/I18nTypes'
import { SITE_URL } from '@/libs/seo/siteUrl'

const APP_HOST = SITE_URL

/**
 * POST /api/posts/[postId]/share
 * Creates (or returns cached) a short link for the given post.
 * Public endpoint — no auth required.
 * Body: { lang?: string }  → used to build the canonical post URL
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params

    const post = await PostService.getPostById(postId)
    if (!post) {
      return NextResponse.json({ message: PostMessages.POST_NOT_FOUND }, { status: 404 })
    }

    let lang: AppLanguage = DEFAULT_LANGUAGE
    try {
      const body = await request.json()
      if (typeof body?.lang === 'string' && (AVAILABLE_LANGUAGES as readonly string[]).includes(body.lang)) {
        lang = body.lang as AppLanguage
      }
    } catch {
      // body is optional — ignore parse failures
    }

    // buildLangUrl strips the prefix for the default language, so English
    // share links resolve to the canonical (unprefixed) post URL.
    const postUrl = buildLangUrl(lang, `/blog/${post.category.slug}/${post.slug}`)
    const code = await ShortLinkService.getOrCreate(postUrl)
    const shortUrl = `${APP_HOST}/s/${code}`

    return NextResponse.json({ shortUrl, code })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message }, { status: 500 })
  }
}
