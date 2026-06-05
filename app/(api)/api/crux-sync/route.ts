/**
 * POST /api/crux-sync
 * Fetches CrUX field data from the PageSpeed Insights API for key routes
 * and stores P75 CWV values in Redis keyed by route + metric.
 *
 * Secured by CRON_SECRET header. Call from a scheduled cron (daily is enough).
 * Requires GOOGLE_PAGESPEED_API_KEY env var; if absent the handler returns 503.
 *
 * Redis key pattern:  crux:<url_hash>:<metric>
 * TTL: 25 hours (enough to survive a daily poll gap)
 */

import { NextRequest, NextResponse } from 'next/server'
import redisInstance from '@/libs/redis'
import { createHash } from 'crypto'

const CRON_SECRET = process.env.CRON_SECRET ?? ''
const API_KEY = process.env.GOOGLE_PAGESPEED_API_KEY ?? ''
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://kuray.dev'
const TTL_SECONDS = 60 * 60 * 25 // 25 hours

const KEY_ROUTES = ['/', '/blog', '/projects', '/about']
const METRICS = ['largest_contentful_paint', 'cumulative_layout_shift', 'interaction_to_next_paint', 'first_contentful_paint']

interface CrUXResponse {
  record?: {
    metrics?: Record<string, { percentiles?: { p75: number } }>
  }
}

async function fetchCrUX(url: string): Promise<Record<string, number | null>> {
  const apiUrl = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${API_KEY}`
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, formFactor: 'PHONE', metrics: METRICS }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`CrUX API ${res.status}: ${body.slice(0, 200)}`)
  }

  const data: CrUXResponse = await res.json()
  const result: Record<string, number | null> = {}
  for (const metric of METRICS) {
    result[metric] = data.record?.metrics?.[metric]?.percentiles?.p75 ?? null
  }
  return result
}

function urlHash(url: string): string {
  return createHash('sha1').update(url).digest('hex').slice(0, 12)
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-cron-secret')
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!API_KEY) {
    return NextResponse.json({ error: 'GOOGLE_PAGESPEED_API_KEY not configured' }, { status: 503 })
  }

  const redis = redisInstance
  const results: Record<string, Record<string, number | null>> = {}
  const errors: string[] = []

  for (const route of KEY_ROUTES) {
    const url = `${SITE_URL}${route}`
    try {
      const metrics = await fetchCrUX(url)
      results[route] = metrics
      const hash = urlHash(url)
      for (const [metric, value] of Object.entries(metrics)) {
        if (value !== null) {
          await redis.set(`crux:${hash}:${metric}`, String(value), 'EX', TTL_SECONDS)
        }
      }
    } catch (err) {
      errors.push(`${route}: ${String(err)}`)
    }
  }

  // Store the last sync timestamp
  await redis.set('crux:last_sync', new Date().toISOString(), 'EX', TTL_SECONDS)

  return NextResponse.json(
    { ok: true, results, errors: errors.length ? errors : undefined },
    { status: errors.length === KEY_ROUTES.length ? 502 : 200 }
  )
}
