export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import PostService from '@/services/PostService'
import { SITE_URL } from '@/libs/seo/siteUrl'
import redisInstance from '@/libs/redis'

const CACHE_KEY = 'feed:atom'
const CACHE_TTL = 60 * 60

function escapeXml(str: string | null | undefined): string {
  if (!str) return ''
  return str.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;'
      case '>': return '&gt;'
      case '&': return '&amp;'
      case "'": return '&apos;'
      case '"': return '&quot;'
      default: return c
    }
  })
}

export async function GET() {
  try {
    const cached = await redisInstance.get(CACHE_KEY)
    if (cached) {
      return new NextResponse(cached, {
        headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
      })
    }
  } catch {}

  const posts = await PostService.getAllPostSlugs()
  const updated = posts[0]?.createdAt ? new Date(posts[0].createdAt).toISOString() : new Date().toISOString()

  const entries = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.categorySlug}/${p.slug}`
      const pubDate = new Date(p.createdAt).toISOString()
      const modDate = p.updatedAt ? new Date(p.updatedAt).toISOString() : pubDate
      return `  <entry>
    <title>${escapeXml(p.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <published>${pubDate}</published>
    <updated>${modDate}</updated>
    <author><name>${escapeXml(p.authorName)}</name></author>
    <category term="${escapeXml(p.categorySlug)}" label="${escapeXml(p.categoryTitle)}"/>
    <summary type="html">${escapeXml(p.description || '')}</summary>
  </entry>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Kuray Karaaslan — Blog</title>
  <link href="${SITE_URL}/blog" rel="alternate" type="text/html"/>
  <link href="${SITE_URL}/feed.atom" rel="self" type="application/atom+xml"/>
  <id>${SITE_URL}/blog</id>
  <updated>${updated}</updated>
  <author><name>Kuray Karaaslan</name><email>kuray@kuray.dev</email></author>
  <rights>© ${new Date().getFullYear()} Kuray Karaaslan</rights>
${entries}
</feed>`

  try {
    await redisInstance.set(CACHE_KEY, xml, 'EX', CACHE_TTL)
  } catch {}

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  })
}
