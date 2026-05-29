import { DEFAULT_LANGUAGE, getOgLocale } from '@/types/common/I18nTypes'
import { SITE_URL } from '@/libs/seo/siteUrl'

const HOST = SITE_URL

export { getOgLocale }

/** Returns a full URL, prepending /{lang} for non-default languages */
export function buildLangUrl(lang: string, path: string): string {
  const prefix = lang === DEFAULT_LANGUAGE ? '' : `/${lang}`
  return `${HOST}${prefix}${path}`
}

/**
 * Builds canonical + hreflang alternates for Next.js Metadata.
 * Pass only the languages this specific URL is actually available in
 * (e.g. for blog posts, only the langs the post has been translated to).
 * @param lang - current page language
 * @param path - path WITHOUT lang prefix (e.g. /blog/category/post)
 * @param availableLangs - language codes that have this content (must include 'en')
 */
export function buildAlternates(
  lang: string,
  path: string,
  availableLangs: string[]
): { canonical: string; languages: Record<string, string> } {
  const canonical = buildLangUrl(lang, path)
  const languages: Record<string, string> = {}
  for (const l of availableLangs) {
    languages[l] = buildLangUrl(l, path)
  }
  // x-default always points to the default (English) version
  languages['x-default'] = buildLangUrl(DEFAULT_LANGUAGE, path)
  return { canonical, languages }
}
