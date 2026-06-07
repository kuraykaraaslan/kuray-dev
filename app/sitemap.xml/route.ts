export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getSitemapEntries, serializeSitemap } from '@/helpers/SitemapData'

/**
 * /sitemap.xml — served as a custom route handler (instead of the `app/sitemap.ts`
 * MetadataRoute convention) so it can reference an XSL stylesheet. The stylesheet
 * makes browsers render a readable page; crawlers ignore the PI and parse the
 * urlset normally.
 */
export async function GET() {
  const entries = await getSitemapEntries()
  const xml = serializeSitemap(entries, { stylesheetHref: '/sitemap.xsl' })

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
