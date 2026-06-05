/**
 * CrUX poll script — hits /api/crux-sync to refresh field-data in Redis.
 * Run on a daily cron (e.g. from ecosystem.config.js or Vercel cron).
 *
 * Usage: CRON_SECRET=... SITE_URL=https://kuray.dev tsx scripts/crux-poll.ts
 */

const BASE = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SECRET = process.env.CRON_SECRET ?? ''

async function main() {
  if (!SECRET) {
    console.error('CRON_SECRET not set — aborting')
    process.exit(1)
  }

  const res = await fetch(`${BASE}/api/crux-sync`, {
    method: 'POST',
    headers: { 'x-cron-secret': SECRET, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
  })

  const body = await res.json()
  if (!res.ok) {
    console.error('CrUX sync failed:', body)
    process.exit(1)
  }

  console.log('CrUX sync OK:', JSON.stringify(body, null, 2))
}

main()

export {}
