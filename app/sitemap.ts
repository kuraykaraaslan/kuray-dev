import type { MetadataRoute } from 'next'
import PostService from '@/services/PostService'
import ProjectService from '@/services/ProjectService'
import { SITE_URL } from '@/lib/seo/siteUrl'

export const dynamic = 'force-dynamic'

const URLS_PER_SITEMAP = 5000

export async function generateSitemaps() {
  // Three logical sitemaps: 0=static, 1=projects, 2..N=blog (paginated)
  let postPages = 1
  try {
    const posts = await PostService.getAllPostSlugs()
    postPages = Math.max(1, Math.ceil(posts.length / URLS_PER_SITEMAP))
  } catch {
    postPages = 1
  }
  const ids: { id: number }[] = [{ id: 0 }, { id: 1 }]
  for (let i = 0; i < postPages; i++) ids.push({ id: 2 + i })
  return ids
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  if (id === 0) {
    return [
      { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
      { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${SITE_URL}/projects`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
      { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ]
  }

  if (id === 1) {
    try {
      const projects = await ProjectService.getAllProjectSlugs()
      return projects.map((p: any) => ({
        url: `${SITE_URL}/projects/${p.slug}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    } catch {
      return []
    }
  }

  // Blog post sitemaps: id >= 2, paginated
  try {
    const posts = await PostService.getAllPostSlugs()
    const offset = (id - 2) * URLS_PER_SITEMAP
    return posts.slice(offset, offset + URLS_PER_SITEMAP).map((post) => ({
      url: `${SITE_URL}/blog/${post.categorySlug}/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : post.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    return []
  }
}
