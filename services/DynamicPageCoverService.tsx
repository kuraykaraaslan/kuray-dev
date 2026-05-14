import { ImageResponse } from 'next/og'
import redis from '@/libs/redis'

interface PageInfo {
  dynamicPageId: string
  title: string
  description?: string | null
}

export default class DynamicPageCoverService {
  private static readonly CACHE_TTL = 60 * 60 * 24 * 7 // 7 days
  private static readonly CACHE_PREFIX = 'dynpage:og:'

  private static key(pageId: string) {
    return `${this.CACHE_PREFIX}${pageId}`
  }

  static async resetById(pageId: string) {
    await redis.del(this.key(pageId))
    return { cleared: true }
  }

  static async getImage(page: PageInfo): Promise<Response | null> {
    if (!page.dynamicPageId) return null

    const cacheKey = this.key(page.dynamicPageId)
    const cached = await redis.get(cacheKey)

    if (cached) {
      const buffer = Buffer.from(cached, 'base64')
      return new Response(
        buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        {
          status: 200,
          headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=604800',
          },
        }
      )
    }

    const title = page.title.length > 80 ? page.title.slice(0, 77) + '…' : page.title
    const description = page.description
      ? page.description.length > 140
        ? page.description.slice(0, 137) + '…'
        : page.description
      : null

    const svgPattern = encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='630'>
        <defs>
          <pattern id='g' x='0' y='0' width='60' height='60' patternUnits='userSpaceOnUse'>
            <path d='M 60 0 L 0 0 0 60' fill='none' stroke='rgba(255,196,24,0.06)' stroke-width='1'/>
          </pattern>
        </defs>
        <rect width='1200' height='630' fill='%23282626'/>
        <rect width='1200' height='630' fill='url(%23g)'/>
        <rect x='0' y='0' width='6' height='630' fill='%23ffc418'/>
        <circle cx='1100' cy='80' r='200' fill='rgba(255,196,24,0.04)'/>
        <circle cx='1050' cy='550' r='120' fill='rgba(255,196,24,0.03)'/>
      </svg>
    `)

    const res = new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            backgroundColor: '#282626',
            backgroundImage: `url("data:image/svg+xml,${svgPattern}")`,
            backgroundSize: 'cover',
            padding: '80px 100px 80px 120px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Accent bar already in SVG */}

          {/* Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 32,
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(255,196,24,0.15)',
                border: '1px solid rgba(255,196,24,0.3)',
                borderRadius: 6,
                padding: '6px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#ffc418',
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              kuraykaraaslan.com
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? 52 : 64,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: description ? 24 : 0,
              maxWidth: 900,
            }}
          >
            {title}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.5,
                maxWidth: 820,
              }}
            >
              {description}
            </div>
          )}

          {/* Bottom accent line */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: '#ffc418',
            }}
          />
        </div>
      ),
      { width: 1200, height: 630 }
    )

    const arrayBuffer = await res.arrayBuffer()
    await redis.setex(cacheKey, this.CACHE_TTL, Buffer.from(arrayBuffer).toString('base64'))

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800',
      },
    })
  }
}
