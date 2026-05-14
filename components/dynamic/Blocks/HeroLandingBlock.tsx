'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Full-height homepage hero:
//   - min-h-screen, two-column
//   - Multi-line title with accent colour line in the middle
//   - Gradient overlay + accent glow on image

function HeroLandingBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

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

  return (
    <BaseBlock {...baseProps}>
      <div className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-20 pt-32">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl text-base-content leading-tight">
              {titleLine1}
              {titleLine2 && <span className="block">{titleLine2}</span>}
              {titleAccent && (
                <span className="block text-primary">
                  {titleAccent}
                </span>
              )}
              {titleLine3 && <span className="block">{titleLine3}</span>}
            </h1>

            {subtitle && (
              <p className="text-xl leading-relaxed text-base-content/80">
                {subtitle}
              </p>
            )}

            {description && (
              <p className="text-lg leading-relaxed text-base-content/70">
                {description}
              </p>
            )}

            {(primaryCtaLabel || secondaryCtaLabel) && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {primaryCtaLabel && (
                  <Link
                    href={primaryCtaHref}
                    className="btn btn-primary px-8 py-4 text-lg text-center"
                  >
                    {primaryCtaLabel}
                  </Link>
                )}
                {secondaryCtaLabel && (
                  <Link
                    href={secondaryCtaHref}
                    className="btn btn-outline px-8 py-4 text-lg text-center"
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
                  <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-base-100 via-transparent to-transparent" />
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-base-200 border border-dashed border-base-content/10 rounded-lg">
                  <span className="text-sm text-base-content/20">
                    Image URL not set
                  </span>
                </div>
              )}
            </div>
            {imageUrl && (
              <div className="absolute -inset-4 rounded-lg opacity-20 blur-xl bg-primary" />
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const HeroLandingBlockDefinition: BlockDefinition = {
  type: 'HeroLandingBlock',
  label: 'Hero — Landing (Full Height)',
  category: 'Hero',
  description:
    'Full-height homepage hero: multi-line title with accent colour, dual CTAs, image with gradient + glow',
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
    secondaryCtaHref: '/solutions',
    imageUrl:
      'https://images.unsplash.com/photo-1750969185331-e03829f72c7d?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Digital network visualization',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    titleLine1: { label: 'Title Line 1', type: 'text' },
    titleLine2: { label: 'Title Line 2', type: 'text' },
    titleAccent: { label: 'Title Accent Line (primary colour)', type: 'text' },
    titleLine3: { label: 'Title Line 3', type: 'text' },
    subtitle: { label: 'Subtitle (bold emphasis)', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    primaryCtaLabel: { label: 'Primary Button Label', type: 'text' },
    primaryCtaHref: { label: 'Primary Button URL', type: 'url' },
    secondaryCtaLabel: { label: 'Secondary Button Label', type: 'text' },
    secondaryCtaHref: { label: 'Secondary Button URL', type: 'url' },
    imageUrl: {
      label: 'Image',
      type: 'img',
      uploadFolder: 'content',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HeroLandingBlock as unknown as BlockDefinition['Component'],
}

export default HeroLandingBlock
