import { NextRequest, NextResponse } from 'next/server'
import redisInstance from '@/libs/redis'

const VITALS_KEY_PREFIX = 'vitals:'
const BUCKET_SECONDS = 300 // 5-minute buckets
const TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days

interface VitalPayload {
  name: 'CLS' | 'INP' | 'LCP' | 'FCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  id: string
  navigationType?: string
  url?: string
}

export async function POST(request: NextRequest) {
  let payload: VitalPayload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, value, rating } = payload
  if (!name || typeof value !== 'number') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const bucket = Math.floor(Date.now() / 1000 / BUCKET_SECONDS) * BUCKET_SECONDS
  const key = `${VITALS_KEY_PREFIX}${name}:${bucket}`

  try {
    await redisInstance.rpush(key, JSON.stringify({ value, rating, ts: Date.now() }))
    await redisInstance.expire(key, TTL_SECONDS)
  } catch {
    // non-critical — don't fail the request if Redis is unavailable
  }

  return NextResponse.json({ ok: true }, { status: 202 })
}
