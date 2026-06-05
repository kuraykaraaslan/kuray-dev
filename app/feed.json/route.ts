export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import PostService from '@/services/PostService'
import { SITE_URL } from '@/libs/seo/siteUrl'
import redisInstance from '@/libs/redis'

const CACHE_KEY = 'feed:json'
const CACHE_TTL = 60 * 60

export async function GET() {
  try {
    const cached = await redisInstance.get(CACHE_KEY)
    if (cached) {
      return new NextResponse(cached, {
        headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
      })
    }
  } catch {}

  const posts = await PostService.getAllPostSlugs()

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Kuray Karaaslan — Blog',
    home_page_url: `${SITE_URL}/blog`,
    feed_url: `${SITE_URL}/feed.json`,
    description: 'Posts about full-stack development, React, Next.js, Java, and more.',
    author: { name: 'Kuray Karaaslan', url: `${SITE_URL}/about` },
    items: posts.map((p) => ({
      id: `${SITE_URL}/blog/${p.categorySlug}/${p.slug}`,
      url: `${SITE_URL}/blog/${p.categorySlug}/${p.slug}`,
      title: p.title,
      summary: p.description || undefined,
      date_published: new Date(p.createdAt).toISOString(),
      date_modified: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date(p.createdAt).toISOString(),
      authors: [{ name: p.authorName }],
      tags: [p.categoryTitle],
    })),
  }

  const body = JSON.stringify(feed, null, 2)

  try {
    await redisInstance.set(CACHE_KEY, body, 'EX', CACHE_TTL)
  } catch {}

  return new NextResponse(body, {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  })
}
