import { ImageResponse } from 'next/og'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import PostService from '@/services/PostService'
import Logger from '@/libs/logger'

// Runs on Node runtime — we need `sharp` for PNG→JPEG conversion.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 1200x627 = LinkedIn / X link-preview ratio (matches Image_Renderer "link" format).
const WIDTH = 1200
const HEIGHT = 627

// Light theme tokens — mirrored from
//   /home/kuray/00_Config_and_AI_Rules/Image_Renderer/config/brand.js
// and the .fmt-link overrides in
//   /home/kuray/00_Config_and_AI_Rules/Image_Renderer/templates/_base.css
const THEME = {
  bg: '#ffffff',
  text: '#111827',
  sub: '#6b7280',
  accent: '#2563eb',
  line: '#e5e7eb',
} as const

const HEADERS = {
  'Content-Type': 'image/jpeg',
  // 1 day fresh, 1 week stale-while-revalidate.
  'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
} as const

// Smallest valid JPEG (1x1 white) for error/not-found bodies.
const FALLBACK_JPEG = Buffer.from(
  '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAP////////////////////////////////////////////////////////////////////////////////////////////////8AAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAf/AABEIAAEAAQMBEQACEQEDEQH/xAAUAAEAAAAAAAAAAAAAAAAAAAAJ/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wD/2Q==',
  'base64'
)

// Module-scope font cache. First request warms it; subsequent requests reuse.
type FontBundle = {
  interRegular: ArrayBuffer
  interExtraBold: ArrayBuffer
  monoRegular: ArrayBuffer
  monoSemiBold: ArrayBuffer
}
let fontPromise: Promise<FontBundle> | null = null

// Google Fonts CSS API returns a stylesheet pointing to the actual .ttf URLs.
// We fetch the CSS first, then the binary font, both cached for the process lifetime.
async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    family
  )}:wght@${weight}&display=swap`
  const cssRes = await fetch(cssUrl, {
    // Modern UAs get woff2 from Google Fonts; @vercel/og can only parse ttf.
    // The legacy "Mozilla/4.0" UA still returns truetype urls.
    headers: { 'User-Agent': 'Mozilla/4.0' },
  })
  const css = await cssRes.text()
  const match = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/)
  if (!match) throw new Error(`Could not resolve TTF for ${family} ${weight}`)
  const fontRes = await fetch(match[1])
  return await fontRes.arrayBuffer()
}

async function loadFonts(): Promise<FontBundle> {
  if (!fontPromise) {
    fontPromise = (async () => {
      const [interRegular, interExtraBold, monoRegular, monoSemiBold] =
        await Promise.all([
          fetchFont('Inter', 400),
          fetchFont('Inter', 800),
          fetchFont('JetBrains Mono', 400),
          fetchFont('JetBrains Mono', 600),
        ])
      return { interRegular, interExtraBold, monoRegular, monoSemiBold }
    })().catch((err) => {
      // Reset so a transient failure doesn't poison the cache forever.
      fontPromise = null
      throw err
    })
  }
  return fontPromise
}

function truncate(input: string | null | undefined, max: number): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (trimmed.length <= max) return trimmed
  return trimmed.slice(0, max - 1).trimEnd() + '…'
}

function renderCard(title: string, sub: string | null, slugLabel: string, kicker: string) {
  // Matches the .fmt-link link-card.js template:
  //   kicker (mono uppercase, accent) → h-cover (Inter 800 60px) → lead (Inter 400 30px)
  //   → footer with accent dot + author and slug.
  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: THEME.bg,
        color: THEME.text,
        padding: '72px 80px',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter',
      }}
    >
      {/* KICKER */}
      <div
        style={{
          display: 'flex',
          fontFamily: 'JetBrainsMono',
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: THEME.accent,
        }}
      >
        {kicker}
      </div>

      {/* CONTENT (centered vertically, like .content.center) */}
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: '-0.02em',
            color: THEME.text,
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              fontWeight: 400,
              lineHeight: 1.45,
              color: THEME.sub,
              marginTop: 22,
            }}
          >
            {sub}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        style={{
          display: 'flex',
          flex: 'none',
          marginTop: 28,
          paddingTop: 22,
          borderTop: `2px solid ${THEME.line}`,
          alignItems: 'center',
          justifyContent: 'space-between',
          fontFamily: 'JetBrainsMono',
          fontSize: 22,
          color: THEME.sub,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: THEME.accent,
              marginRight: 14,
            }}
          />
          <div style={{ display: 'flex' }}>Kuray Karaaslan</div>
        </div>
        <div style={{ display: 'flex' }}>{slugLabel}</div>
      </div>
    </div>
  )
}

async function renderJpeg(
  title: string,
  sub: string | null,
  slugLabel: string,
  kicker: string
): Promise<Buffer> {
  const fonts = await loadFonts()
  const png = new ImageResponse(renderCard(title, sub, slugLabel, kicker), {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      { name: 'Inter', data: fonts.interRegular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.interExtraBold, weight: 800, style: 'normal' },
      { name: 'JetBrainsMono', data: fonts.monoRegular, weight: 400, style: 'normal' },
      { name: 'JetBrainsMono', data: fonts.monoSemiBold, weight: 600, style: 'normal' },
    ],
  })
  const pngBuffer = Buffer.from(await png.arrayBuffer())
  return await sharp(pngBuffer).jpeg({ quality: 88, mozjpeg: true }).toBuffer()
}

function jpegResponse(body: Buffer, status = 200): NextResponse {
  return new NextResponse(new Uint8Array(body), { status, headers: HEADERS })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params

  try {
    const post = await PostService.getPostById(postId)
    if (!post) return jpegResponse(FALLBACK_JPEG, 404)

    const title = truncate(post.title, 110) ?? 'Untitled'
    const sub = truncate(post.description, 120)
    const slugLabel = post.slug ? post.slug : 'kuraydev.com'
    const kicker = (post.category?.title || 'BLOG').toUpperCase()

    const jpeg = await renderJpeg(title, sub, slugLabel, kicker)
    return jpegResponse(jpeg, 200)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    Logger.error(`cover.jpeg render failed (postId=${postId}): ${msg}`)
    // eslint-disable-next-line no-console
    console.error('[cover.jpeg]', postId, err)
    return jpegResponse(FALLBACK_JPEG, 500)
  }
}
