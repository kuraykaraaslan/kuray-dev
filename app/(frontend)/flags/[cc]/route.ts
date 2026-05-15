/**
 * Serves country flag SVGs from the `country-flag-icons` npm package.
 * Path: /flags/{ISO-3166-2}  → returns the SVG (3x2 aspect).
 *
 * Replaces external dependencies on kapowaz.github.io / flagcdn.com so flags
 * are first-party, cacheable, and survive third-party CDN outages.
 */
import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const FLAGS_DIR = path.join(process.cwd(), 'node_modules', 'country-flag-icons', '3x2')

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cc: string }> }
) {
  const { cc } = await params
  const safe = cc.replace(/[^A-Z]/gi, '').toUpperCase()
  if (safe.length !== 2) {
    return new NextResponse('Bad country code', { status: 400 })
  }

  try {
    const svg = await readFile(path.join(FLAGS_DIR, `${safe}.svg`), 'utf-8')
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
