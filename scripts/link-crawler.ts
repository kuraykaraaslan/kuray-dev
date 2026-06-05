/**
 * Broken-link + redirect-chain crawler.
 *
 * 1. Reads <loc> URLs from /sitemap.xml (or AUDIT_BASE_URL sitemap).
 * 2. Fetches each URL manually (no auto-follow) to detect redirect chains > 1 hop.
 * 3. Reports 4xx/5xx responses and chains longer than MAX_REDIRECTS.
 *
 * Usage:
 *   AUDIT_BASE_URL=http://localhost:3000 tsx scripts/link-crawler.ts
 * Exits non-zero on any failure so it gates CI.
 */

const BASE = process.env.AUDIT_BASE_URL ?? 'http://localhost:3000'
const MAX_REDIRECTS = 1         // warn on chains longer than this
const CONCURRENCY = 5           // parallel fetches
const TIMEOUT_MS = 10_000

interface Result {
  url: string
  status: number
  redirectChain: string[]
  error?: string
}

async function fetchNoFollow(url: string, ttl = 5): Promise<Result> {
  const chain: string[] = []
  let current = url

  for (let hop = 0; hop <= ttl; hop++) {
    let res: Response
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
      res = await fetch(current, { redirect: 'manual', signal: ctrl.signal })
      clearTimeout(timer)
    } catch (err: unknown) {
      return { url, status: 0, redirectChain: chain, error: String(err) }
    }

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get('location')
      if (!loc) return { url, status: res.status, redirectChain: chain }
      chain.push(current)
      current = loc.startsWith('http') ? loc : new URL(loc, BASE).toString()
      continue
    }

    return { url, status: res.status, redirectChain: chain }
  }

  return { url, status: 0, redirectChain: chain, error: 'Too many redirects' }
}

async function getSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${BASE}/sitemap.xml`, { signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`Sitemap fetch failed: HTTP ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim())
}

async function crawlBatch(urls: string[]): Promise<Result[]> {
  const results: Result[] = []
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    const settled = await Promise.all(batch.map(fetchNoFollow))
    results.push(...settled)
  }
  return results
}

async function main() {
  let urls: string[]
  try {
    urls = await getSitemapUrls()
  } catch (err) {
    console.error(`Failed to fetch sitemap: ${String(err)}`)
    process.exit(1)
  }

  console.log(`Crawling ${urls.length} URLs from sitemap…\n`)
  const results = await crawlBatch(urls)

  let failed = false

  for (const r of results) {
    const isError = r.error || r.status === 0 || r.status >= 400
    const isLongChain = r.redirectChain.length > MAX_REDIRECTS

    if (isError) {
      console.error(`  ✗ ${r.url}  →  ${r.error ?? `HTTP ${r.status}`}`)
      failed = true
    } else if (isLongChain) {
      console.warn(`  ⚠ ${r.url}  →  redirect chain (${r.redirectChain.length} hops): ${r.redirectChain.join(' → ')}`)
      failed = true
    } else if (r.redirectChain.length > 0) {
      console.log(`  ~ ${r.url}  →  ${r.status} (1 redirect)`)
    } else {
      console.log(`  ✓ ${r.url}  →  ${r.status}`)
    }
  }

  if (failed) {
    console.error('\nLink crawl FAILED')
    process.exit(1)
  }
  console.log('\nLink crawl passed ✓')
}

main()
