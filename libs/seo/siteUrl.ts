// Single source of truth for the public site origin.
// Prefers NEXT_PUBLIC_SITE_URL (canonical, set in .env.production / .env.local),
// falls back to the legacy NEXT_PUBLIC_APPLICATION_HOST, then to the prod URL.
// Trailing slash is stripped so callers can safely concatenate paths.
const raw =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APPLICATION_HOST ||
  'https://kuray.dev'

export const SITE_URL = raw.replace(/\/$/, '')

/** Join SITE_URL with a path. Path may start with or without a leading slash. */
export function siteUrl(path = ''): string {
  if (!path) return SITE_URL + '/'
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
