'use client'

import Link from 'next/link'
import { ImageWithFallback } from '@/components/frontend/ImageWithFallback'
import type { BlockDefinition } from '../types'

// Matches the full-height homepage hero:
//   - min-h-screen, two-column
//   - Multi-line title with yellow accent line in the middle
//   - Gradient overlay + yellow glow on image

function HeroLandingBlock(rawProps: Record<string, unknown>) {
  const titleLine1 = (rawProps.titleLine1 as string) || 'AI-Driven Transformation'
  const titleLine2 = rawProps.titleLine2 as string | undefined
  const titleAccent = rawProps.titleAccent as string | undefined
  const titleLine3 = rawProps.titleLine3 as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const description = rawProps.description as string | undefined
  const primaryCtaLabel = rawProps.primaryCtaLabel as string | undefined
  const primaryCtaHref = (rawProps.primaryCtaHref as string) || '/contact'
  const secondaryCtaLabel = rawProps.secondaryCtaLabel as string | undefined
  const secondaryCtaHref = (rawProps.secondaryCtaHref as string) || '/solutions'
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = (rawProps.imageAlt as string) || ''
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  return (
    <section
      className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-20 pt-32"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left: Text */}
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
            {titleLine1}
            {titleLine2 && <span className="block">{titleLine2}</span>}
            {titleAccent && <span className="block" style={{ color: accent }}>{titleAccent}</span>}
            {titleLine3 && <span className="block">{titleLine3}</span>}
          </h1>

          {subtitle && (
            <p className="text-xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {subtitle}
            </p>
          )}

          {description && (
            <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {description}
            </p>
          )}

          {(primaryCtaLabel || secondaryCtaLabel) && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {primaryCtaLabel && (
                <Link
                  href={primaryCtaHref}
                  className="px-8 py-4 rounded-md text-lg font-medium transition-all hover:scale-105 text-center"
                  style={{ backgroundColor: accent, color: bg }}
                >
                  {primaryCtaLabel}
                </Link>
              )}
              {secondaryCtaLabel && (
                <Link
                  href={secondaryCtaHref}
                  className="px-8 py-4 border-2 rounded-md text-lg font-medium text-white border-white/30 hover:border-white/60 transition-all text-center"
                >
                  {secondaryCtaLabel}
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right: Image with gradient + glow */}
        <div className="relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0 rounded-lg overflow-hidden opacity-70">
            {imageUrl ? (
              <>
                <ImageWithFallback
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top right, ${bg}, transparent, transparent)`,
                  }}
                />
              </>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
              >
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Image URL not set
                </span>
              </div>
            )}
          </div>
          {imageUrl && (
            <div
              className="absolute -inset-4 rounded-lg opacity-20 blur-xl"
              style={{ backgroundColor: accent }}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export const HeroLandingBlockDefinition: BlockDefinition = {
  type: 'HeroLandingBlock',
  label: 'Hero — Landing (Full Height)',
  category: 'Hero',
  description:
    'Full-height homepage hero: multi-line title with yellow accent, dual CTAs, image with gradient + glow',
  defaultProps: {
    titleLine1: 'AI-Driven Transformation',
    titleLine2: 'for complex',
    titleAccent: 'AECO',
    titleLine3: 'Organizations',
    subtitle: 'Your Partner in Smarter, Faster, and More Efficient AECO Projects',
    description:
      'We help enterprise architecture, engineering, infrastructure, and development teams simplify complexity, eliminate delivery risk, and execute large-scale projects with confidence.',
    primaryCtaLabel: 'Talk to an Expert',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'Explore Solutions',
    secondaryCtaHref: '/solutions/digital-solutions',
    imageUrl:
      'https://images.unsplash.com/photo-1750969185331-e03829f72c7d?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Digital network visualization',
    bgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    titleLine1: { label: 'Title Line 1 (white)', type: 'text' },
    titleLine2: { label: 'Title Line 2 (white)', type: 'text' },
    titleAccent: { label: 'Title Accent Line (yellow)', type: 'text' },
    titleLine3: { label: 'Title Line 3 (white)', type: 'text' },
    subtitle: { label: 'Subtitle (bold emphasis)', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    primaryCtaLabel: { label: 'Primary Button Label', type: 'text' },
    primaryCtaHref: { label: 'Primary Button URL', type: 'url' },
    secondaryCtaLabel: { label: 'Secondary Button Label', type: 'text' },
    secondaryCtaHref: { label: 'Secondary Button URL', type: 'url' },
    imageUrl: { label: 'Image', type: 'img', uploadFolder: 'content', accept: 'image/jpeg,image/png,image/webp,image/avif' },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: HeroLandingBlock,
}

export default HeroLandingBlock
