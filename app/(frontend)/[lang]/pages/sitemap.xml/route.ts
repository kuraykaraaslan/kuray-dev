export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import { getBaseUrl, renderUrlSet } from '@/helpers/SitemapGenerator'
import redisInstance from '@/libs/redis'
import type { SitemapUrl } from '@/types/common/SitemapTypes'

const CACHE_KEY = 'sitemap:pages'
const CACHE_TTL = 60 * 60 // 1 hour

export async function GET() {
  const cached = await redisInstance.get(CACHE_KEY)
  if (cached) {
    return new NextResponse(cached, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    })
  }

  const BASE = getBaseUrl()

  const pages = await prisma.dynamicPage.findMany({
    where: { status: 'PUBLISHED', NOT: { slug: '' } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
  })

  const urls: SitemapUrl[] = pages.map((p) => ({
    loc: `${BASE}/${p.slug}`,
    lastmod: p.updatedAt.toISOString(),
    changefreq: 'monthly',
    priority: 0.6,
  }))

  const xml = renderUrlSet(urls)
  await redisInstance.set(CACHE_KEY, xml, 'EX', CACHE_TTL)

  return new NextResponse(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
