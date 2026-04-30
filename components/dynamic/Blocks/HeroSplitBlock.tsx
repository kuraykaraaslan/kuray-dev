'use client'

import Link from 'next/link'
import { ImageWithFallback } from '@/components/frontend/ImageWithFallback'
import type { BlockDefinition } from '../types'

// Matches the two-column hero used on all individual product pages (MIRAR, ANDIAMO, etc.):
//   - Left: tagline + title + hook question + subheading + description + dual CTAs
//   - Right: full-height image with 70% opacity
//   - imagePosition controls which side the image is on

function HeroSplitBlock(rawProps: Record<string, unknown>) {
  const tagline = rawProps.tagline as string | undefined
  const title = (rawProps.title as string) || 'Product Name'
  const hook = rawProps.hook as string | undefined
  const subheading = rawProps.subheading as string | undefined
  const description = rawProps.description as string | undefined
  const primaryCtaLabel = rawProps.primaryCtaLabel as string | undefined
  const primaryCtaHref = (rawProps.primaryCtaHref as string) || '/contact'
  const secondaryCtaLabel = rawProps.secondaryCtaLabel as string | undefined
  const secondaryCtaHref = (rawProps.secondaryCtaHref as string) || '/products'
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = (rawProps.imageAlt as string) || title
  const imagePosition = (rawProps.imagePosition as string) || 'right'
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  const textCol = (
    <div>
      {tagline && (
        <p className="text-sm font-medium mb-4" style={{ color: accent }}>
          {tagline}
        </p>
      )}

      <h1 className="text-5xl md:text-6xl text-base-content mb-6 leading-tight">{title}</h1>

      {hook && (
        <p className="text-2xl mb-6" style={{ color: 'oklch(var(--bc) / 0.8)' }}>
          {hook}
        </p>
      )}

      {subheading && (
        <p className="text-xl mb-4" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
          {subheading}
        </p>
      )}

      {description && (
        <p className="leading-relaxed mb-8" style={{ color: 'oklch(var(--bc) / 0.6)' }}>
          {description}
        </p>
      )}

      {(primaryCtaLabel || secondaryCtaLabel) && (
        <div className="flex flex-wrap gap-4">
          {primaryCtaLabel && (
            <Link
              href={primaryCtaHref}
              className="inline-block px-8 py-4 rounded-md text-lg font-medium transition-all hover:scale-105"
            >
              {primaryCtaLabel}
            </Link>
          )}
          {secondaryCtaLabel && (
            <Link
              href={secondaryCtaHref}
              className="inline-block px-8 py-4 border-2 rounded-md text-lg font-medium text-base-content transition-all hover:border-white/60"
              style={{ borderColor: 'oklch(var(--bc) / 0.3)' }}
            >
              {secondaryCtaLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  )

  const imageCol = imageUrl ? (
    <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
      <ImageWithFallback
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-full object-cover"
        style={{ opacity: 0.7 }}
      />
    </div>
  ) : (
    <div
      className="h-[400px] md:h-[500px] rounded-lg flex items-center justify-center"
      style={{ backgroundColor: 'oklch(var(--bc) / 0.05)', border: '1px dashed oklch(var(--bc) / 0.15)' }}
    >
      <span className="text-sm" style={{ color: 'oklch(var(--bc) / 0.25)' }}>
        Image URL not set
      </span>
    </div>
  )

  return (
    <section className="px-6 md:px-12 lg:px-20 py-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {imagePosition === 'left' ? (
            <>
              {imageCol}
              {textCol}
            </>
          ) : (
            <>
              {textCol}
              {imageCol}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export const HeroSplitBlockDefinition: BlockDefinition = {
  type: 'HeroSplitBlock',
  label: 'Hero — Split (Image + Text)',
  category: 'Hero',
  description: 'Two-column hero: text on one side, image on the other — used on product pages',
  defaultProps: {
    tagline: 'Revit Tools by Kuray Karaaslan',
    title: 'MIRAR®',
    hook: 'Would you like to generate lots of image options in seconds?',
    subheading: 'Experience the next level of design precision and creativity.',
    description:
      'Transform your designs with immersive visualizations using precision in and outside Autodesk Revit, bringing your ideas to life instantly.',
    primaryCtaLabel: 'Free Trial Now!',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'All AI Tools',
    secondaryCtaHref: '/products/ai-tools',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Product visualization',
    imagePosition: 'right',
    bgColor: '',
    accentColor: '',
  },
  schema: {
    tagline: {
      label: 'Tagline (above title)',
      type: 'text',
      placeholder: 'Revit Tools by Kuray Karaaslan',
    },
    title: { label: 'Title / Product Name', type: 'text', placeholder: 'MIRAR®' },
    hook: {
      label: 'Hook (large text)',
      type: 'textarea',
      placeholder: 'Would you like to...',
    },
    subheading: { label: 'Subheading', type: 'text', placeholder: 'Experience the next level...' },
    description: {
      label: 'Description',
      type: 'textarea',
      placeholder: 'Longer description of the product...',
    },
    primaryCtaLabel: { label: 'Primary Button Label', type: 'text', placeholder: 'Free Trial Now!' },
    primaryCtaHref: { label: 'Primary Button URL', type: 'url', placeholder: '/contact' },
    secondaryCtaLabel: {
      label: 'Secondary Button Label',
      type: 'text',
      placeholder: 'All AI Tools',
    },
    secondaryCtaHref: {
      label: 'Secondary Button URL',
      type: 'text',
      placeholder: '/products/ai-tools',
    },
    imageUrl: { label: 'Image', type: 'img', uploadFolder: 'content', accept: 'image/jpeg,image/png,image/webp,image/avif' },
    imageAlt: { label: 'Image Alt Text', type: 'text', placeholder: 'Product visualization' },
    imagePosition: { label: 'Image Position', type: 'select', options: ['right', 'left'] },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: HeroSplitBlock,
}

export default HeroSplitBlock
