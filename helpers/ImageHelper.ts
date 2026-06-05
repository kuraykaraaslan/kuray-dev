/**
 * Image helpers.
 *
 * Production note: behind nginx + `next start`, the built-in Next.js image
 * optimizer cannot self-fetch local /public assets — the loopback request
 * resolves to the public host over the wrong scheme and nginx answers with an
 * HTML redirect instead of the image, so `/_next/image` returns HTTP 400
 * "The requested resource isn't a valid image" for every local file. Remote
 * images optimize fine. We therefore bypass optimization for local assets via
 * next/image's native `unoptimized` prop, while keeping it on for remote URLs.
 *
 * Usage: <Image src={src} unoptimized={isLocalImage(src)} ... />
 */
export const isLocalImage = (src?: string | null): boolean =>
  typeof src === 'string' && src.length > 0 && !/^https?:\/\//i.test(src)
