import type { MetadataRoute } from 'next'
import PostService from '@/services/PostService'
import ProjectService from '@/services/ProjectService'
import { SITE_URL } from '@/lib/seo/siteUrl'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  let projectRoutes: MetadataRoute.Sitemap = []
  let postRoutes: MetadataRoute.Sitemap = []

  try {
    const projects = await ProjectService.getAllProjectSlugs()
    projectRoutes = projects.map((p: any) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch {
    projectRoutes = []
  }

  try {
    const posts = await PostService.getAllPostSlugs()
    postRoutes = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.categorySlug}/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : post.createdAt,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))
  } catch {
    postRoutes = []
  }

  return [...staticRoutes, ...projectRoutes, ...postRoutes]
}
