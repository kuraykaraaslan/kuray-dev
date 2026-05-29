import type { MetadataRoute } from 'next'
import PostService from '@/services/PostService'
import ProjectService from '@/services/ProjectService'
import DynamicPageService from '@/services/DynamicPageService'
import redisInstance from '@/libs/redis'
import { SITE_URL } from '@/libs/seo/siteUrl'

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

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  let projectEntries: MetadataRoute.Sitemap = []
  try {
    const projects = await ProjectService.getAllProjectSlugs()
    projectEntries = projects.map((p: any) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
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
    }))
  } catch {
    postEntries = []
  }

  let dynamicPageEntries: MetadataRoute.Sitemap = []
  try {
    const pages = await DynamicPageService.getSitemapSlugs()
    dynamicPageEntries = pages.map((p) => ({
      url: `${SITE_URL}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    dynamicPageEntries = []
  }

  return [...staticEntries, ...projectEntries, ...postEntries, ...dynamicPageEntries]
}
