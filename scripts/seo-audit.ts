/**
 * Meta-completeness crawl — fetches the key public routes from a running server
 * and asserts each ships the SEO essentials: title, meta description, canonical,
 * hreflang alternates, Open Graph, Twitter card, and at least one parseable
 * JSON-LD block. Also verifies <html lang> matches the route's locale (the proxy
 * x-lang fix). Exits non-zero on any failure so it can gate CI.
 *
 * Usage: start the app (e.g. `next start`), then `AUDIT_BASE_URL=http://localhost:3000 tsx scripts/seo-audit.ts`
 */

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000'

// [path, expected <html lang>]
const ROUTES: Array<[string, string]> = [
  ['/', 'en'],
  ['/blog', 'en'],
  ['/projects', 'en'],
  ['/about', 'en'],
  ['/tr', 'tr'],
]

const CHECKS: Array<[string, RegExp]> = [
  ['<title>', /<title[^>]*>[^<]+<\/title>/i],
  ['meta description', /<meta[^>]+name=["']description["'][^>]+content=["'][^"']+["']/i],
  ['canonical', /<link[^>]+rel=["']canonical["'][^>]+href=/i],
  ['hreflang alternate', /<link[^>]+rel=["']alternate["'][^>]+hreflang=/i],
  ['og:title', /<meta[^>]+property=["']og:title["']/i],
  ['twitter:card', /<meta[^>]+name=["']twitter:card["']/i],
  ['JSON-LD', /<script[^>]+type=["']application\/ld\+json["']/i],
]

async function main() {
  let failed = false
  const fail = (route: string, msg: string) => {
    console.error(`  ✗ ${route}: ${msg}`)
    failed = true
  }

  for (const [route, expectedLang] of ROUTES) {
    const url = `${BASE}${route}`
    let res: Response
    try {
      res = await fetch(url, { redirect: 'follow' })
    } catch (err) {
      fail(route, `fetch failed: ${String(err)}`)
      continue
    }

    if (!res.ok) {
      fail(route, `HTTP ${res.status}`)
      continue
    }

    const html = await res.text()
    console.log(`• ${route} (${res.status})`)

    for (const [name, re] of CHECKS) {
      if (!re.test(html)) fail(route, `missing ${name}`)
    }

    // <html lang> must match the route's locale.
    const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i)
    if (!langMatch) fail(route, 'missing <html lang>')
    else if (langMatch[1] !== expectedLang)
      fail(route, `<html lang="${langMatch[1]}"> expected "${expectedLang}"`)

    // Every JSON-LD block must be valid JSON.
    const ldBlocks = html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)
    for (const m of ldBlocks) {
      try {
        JSON.parse(m[1].trim())
      } catch {
        fail(route, 'invalid JSON-LD block')
      }
    }
  }

  if (failed) {
    console.error('\nSEO audit FAILED')
    process.exit(1)
  }
  console.log('\nSEO audit passed ✓')
}

main()
