export const dynamic = 'force-static'

import { NextResponse } from 'next/server'

/**
 * /sitemap.xsl — the stylesheet referenced by /sitemap.xml. Served via a route
 * handler (not /public) so we control the Content-Type: browsers only apply an
 * XSLT stylesheet when it's delivered as text/xsl (or another XML type).
 */
const STYLESHEET = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="robots" content="noindex"/>
        <title>XML Sitemap</title>
        <style>
          :root { color-scheme: light dark; }
          body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 2rem; line-height: 1.5; }
          h1 { font-size: 1.5rem; margin: 0 0 .25rem; }
          p.meta { color: #6b7280; margin: 0 0 1.5rem; font-size: .9rem; }
          table { border-collapse: collapse; width: 100%; font-size: .875rem; }
          th, td { text-align: left; padding: .5rem .75rem; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
          th { background: #f9fafb; font-weight: 600; position: sticky; top: 0; }
          tr:hover td { background: rgba(127,127,127,.06); }
          td.num { color: #9ca3af; width: 3rem; }
          a { color: #2563eb; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
          @media (prefers-color-scheme: dark) {
            body { background: #0b0e14; color: #e5e7eb; }
            th { background: #11151c; }
            th, td { border-color: #1f2630; }
            p.meta, td.num { color: #6b7280; }
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <p class="meta">
          <xsl:value-of select="count(s:urlset/s:url)"/> URLs. This is an XML sitemap for search engines.
        </p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>URL</th>
              <th>Last modified</th>
              <th>Change freq.</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody>
            <xsl:for-each select="s:urlset/s:url">
              <tr>
                <td class="num"><xsl:value-of select="position()"/></td>
                <td>
                  <a href="{s:loc}"><xsl:value-of select="s:loc"/></a>
                </td>
                <td><xsl:value-of select="s:lastmod"/></td>
                <td><xsl:value-of select="s:changefreq"/></td>
                <td><xsl:value-of select="s:priority"/></td>
              </tr>
            </xsl:for-each>
          </tbody>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
`

export async function GET() {
  return new NextResponse(STYLESHEET, {
    headers: {
      'Content-Type': 'text/xsl; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  })
}
