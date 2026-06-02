import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, getOgLocale } from '@/types/common/I18nTypes'
import { SITE_URL } from '@/libs/seo/siteUrl'

const HOST = SITE_URL
const VALID = new Set<string>(AVAILABLE_LANGUAGES)

export { getOgLocale }

/** Returns a full URL, prepending /{lang} for non-default languages */
export function buildLangUrl(lang: string, path: string): string {
  const prefix = lang === DEFAULT_LANGUAGE ? '' : `/${lang}`
  return `${HOST}${prefix}${path}`
}

/**
 * Dedupe, drop falsy/invalid language codes, and always include the default
 * language. Guards against translation rows with a null/empty `lang` that
 * would otherwise produce `/undefined` hreflang URLs.
 */
export function normalizeLangs(langs: string[]): string[] {
  const out = new Set<string>([DEFAULT_LANGUAGE])
  for (const l of langs) {
    if (l && VALID.has(l)) out.add(l)
  }
  return [...out]
}

/**
 * Builds canonical + hreflang alternates for Next.js Metadata.
 * Pass only the languages this specific URL is actually available in
 * (e.g. for blog posts, only the langs the post has been translated to).
 * Returns `indexableLangs` (the normalized set) so callers can decide whether
 * the current language should be indexed.
 * @param lang - current page language
 * @param path - path WITHOUT lang prefix (e.g. /blog/category/post)
 * @param availableLangs - language codes that have this content (must include 'en')
 */
export function buildAlternates(
  lang: string,
  path: string,
  availableLangs: string[]
): { canonical: string; languages: Record<string, string>; indexableLangs: string[] } {
  const langs = normalizeLangs(availableLangs)
  const canonical = buildLangUrl(lang, path)
  const languages: Record<string, string> = {}
  for (const l of langs) {
    languages[l] = buildLangUrl(l, path)
  }
  // x-default always points to the default (English) version
  languages['x-default'] = buildLangUrl(DEFAULT_LANGUAGE, path)
  return { canonical, languages, indexableLangs: langs }
}

/** Standard Next.js robots metadata block, gated on indexability. */
export function robotsFor(indexable: boolean) {
  return indexable
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-image-preview': 'large' as const,
          'max-snippet': -1,
          'max-video-preview': -1,
        },
      }
    : {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      }
}
