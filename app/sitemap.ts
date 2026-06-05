import type { MetadataRoute } from 'next'
import PostService from '@/services/PostService'
import ProjectService from '@/services/ProjectService'
import DynamicPageService from '@/services/DynamicPageService'
import redisInstance from '@/libs/redis'
import { SITE_URL } from '@/libs/seo/siteUrl'
import { buildAlternates } from '@/helpers/HreflangHelper'
import { INDEXABLE_LANGUAGES } from '@/types/common/I18nTypes'

/**
 * hreflang alternates (incl. x-default) for a path available in `langs`.
 * Reuses the same helper the page-level metadata uses so the sitemap and the
 * per-page <link rel="alternate"> signals stay consistent.
 */
function altLanguages(path: string, langs: string[]) {
  return { languages: buildAlternates('en', path, langs).languages }
}

export const dynamic = 'force-dynamic'

const CACHE_KEY = 'sitemap:root'
const CACHE_TTL = 60 * 60 // 1 hour

/** Join SITE_URL with a path. Path may start with or without a leading slash. */
export function siteUrl(path = ''): string {
  if (!path) return SITE_URL + '/'
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const cached = await redisInstance.get(CACHE_KEY)
    if (cached) {
      return JSON.parse(cached) as MetadataRoute.Sitemap
    }
  } catch {
    // ignore cache read errors and fall through to a fresh build
  }

  const entries = await buildSitemap()

  try {
    await redisInstance.set(CACHE_KEY, JSON.stringify(entries), 'EX', CACHE_TTL)
  } catch {
    // ignore cache write errors
  }

  return entries
}

async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static listings have no per-item translations, so they're advertised in the
  // genuinely-maintained language set (INDEXABLE_LANGUAGES, e.g. en/tr) rather
  // than all 24 UI languages — avoids signalling incomplete translations.
  const staticLangs = [...INDEXABLE_LANGUAGES]
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0, alternates: altLanguages('', staticLangs) },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9, alternates: altLanguages('/blog', staticLangs) },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8, alternates: altLanguages('/projects', staticLangs) },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6, alternates: altLanguages('/about', staticLangs) },
  ]

  let projectEntries: MetadataRoute.Sitemap = []
  try {
    const projects = await ProjectService.getAllProjectSlugs()
    projectEntries = projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: altLanguages(`/projects/${p.slug}`, ['en', ...p.langs]),
    }))
  } catch {
    projectEntries = []
  }

  let postEntries: MetadataRoute.Sitemap = []
  try {
    const posts = await PostService.getAllPostSlugs()
    postEntries = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.categorySlug}/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : post.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: altLanguages(`/blog/${post.categorySlug}/${post.slug}`, ['en', ...post.langs]),
    }))
  } catch {
    postEntries = []
  }

  let dynamicPageEntries: MetadataRoute.Sitemap = []
  try {
    const pages = await DynamicPageService.getSitemapSlugs()
    dynamicPageEntries = pages
      // guard against empty / malformed slugs that produced junk URLs like
      // `${SITE_URL}/` or `${SITE_URL}/&` in Search Console
      .filter((p) => p.slug && /^[a-z0-9][a-z0-9/_-]*$/i.test(p.slug))
      .map((p) => ({
        url: `${SITE_URL}/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
        alternates: altLanguages(`/${p.slug}`, ['en', ...p.langs]),
      }))
  } catch {
    dynamicPageEntries = []
  }

  return [...staticEntries, ...projectEntries, ...postEntries, ...dynamicPageEntries]
}
