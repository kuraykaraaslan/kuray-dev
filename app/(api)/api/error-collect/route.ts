import { NextRequest, NextResponse } from 'next/server'
import redisInstance from '@/libs/redis'

const ERROR_KEY = 'frontend:errors'
const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days, capped at 500 entries

interface ErrorPayload {
  message?: string
  name?: string
  digest?: string
  url?: string
  ts?: number
}

export async function POST(request: NextRequest) {
  let payload: ErrorPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const entry = {
    message: String(payload.message ?? '').slice(0, 500),
    name: String(payload.name ?? 'Error').slice(0, 100),
    digest: payload.digest ? String(payload.digest).slice(0, 50) : undefined,
    url: payload.url ? String(payload.url).slice(0, 300) : undefined,
    ts: Date.now(),
  }

  // Log server-side so errors appear in prod logs regardless of Redis
  console.error('[global-error]', JSON.stringify(entry))

  try {
    const redis = redisInstance
    await redis.lpush(ERROR_KEY, JSON.stringify(entry))
    await redis.ltrim(ERROR_KEY, 0, 499) // keep last 500
    await redis.expire(ERROR_KEY, TTL_SECONDS)
  } catch {
    // non-critical
  }

  return NextResponse.json({ ok: true }, { status: 202 })
}
