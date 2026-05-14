'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Two-column hero used on individual product / service pages:
//   - Left: tagline + title + hook question + subheading + description + dual CTAs
//   - Right: full-height image with 70% opacity
//   - imagePosition controls which side the image is on

function HeroSplitBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

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

  const textCol = (
    <div>
      {tagline && (
        <p className="text-sm font-medium mb-4 text-primary">
          {tagline}
        </p>
      )}

      <h1 className="text-5xl md:text-6xl text-base-content mb-6 leading-tight">{title}</h1>

      {hook && (
        <p className="text-2xl mb-6 text-base-content/80">
          {hook}
        </p>
      )}

      {subheading && (
        <p className="text-xl mb-4 text-base-content/70">
          {subheading}
        </p>
      )}

      {description && (
        <p className="leading-relaxed mb-8 text-base-content/60">
          {description}
        </p>
      )}

      {(primaryCtaLabel || secondaryCtaLabel) && (
        <div className="flex flex-wrap gap-4">
          {primaryCtaLabel && (
            <Link
              href={primaryCtaHref}
              className="btn btn-primary px-8 py-4 text-lg"
            >
              {primaryCtaLabel}
            </Link>
          )}
          {secondaryCtaLabel && (
            <Link
              href={secondaryCtaHref}
              className="btn btn-outline px-8 py-4 text-lg"
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
      <img
        src={imageUrl}
        alt={imageAlt}
        className="w-full h-full object-cover opacity-70"
      />
    </div>
  ) : (
    <div className="h-[400px] md:h-[500px] rounded-lg flex items-center justify-center bg-base-200 border border-dashed border-base-content/15">
      <span className="text-sm text-base-content/25">
        Image URL not set
      </span>
    </div>
  )

  return (
    <BaseBlock {...baseProps}>
      <div className="px-6 md:px-12 lg:px-20 py-20">
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
      </div>
    </BaseBlock>
  )
}

export const HeroSplitBlockDefinition: BlockDefinition = {
  type: 'HeroSplitBlock',
  label: 'Hero — Split (Image + Text)',
  category: 'Hero',
  description: 'Two-column hero: text on one side, image on the other — used on product pages',
  defaultProps: {
    tagline: 'Product Tagline',
    title: 'Product Name',
    hook: 'Would you like to achieve great results in seconds?',
    subheading: 'Experience the next level of precision and creativity.',
    description:
      'Transform your workflow with immersive visualizations and powerful tooling, bringing your ideas to life instantly.',
    primaryCtaLabel: 'Get Started',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'Learn More',
    secondaryCtaHref: '/products',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Product visualization',
    imagePosition: 'right',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    tagline: {
      label: 'Tagline (above title)',
      type: 'text',
      placeholder: 'e.g. Revit Tools',
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
    primaryCtaLabel: { label: 'Primary Button Label', type: 'text', placeholder: 'Get Started' },
    primaryCtaHref: { label: 'Primary Button URL', type: 'url', placeholder: '/contact' },
    secondaryCtaLabel: {
      label: 'Secondary Button Label',
      type: 'text',
      placeholder: 'Learn More',
    },
    secondaryCtaHref: {
      label: 'Secondary Button URL',
      type: 'text',
      placeholder: '/products',
    },
    imageUrl: {
      label: 'Image',
      type: 'img',
      uploadFolder: 'content',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
    imageAlt: { label: 'Image Alt Text', type: 'text', placeholder: 'Product visualization' },
    imagePosition: { label: 'Image Position', type: 'select', options: ['right', 'left'] },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HeroSplitBlock as unknown as BlockDefinition['Component'],
}

export default HeroSplitBlock
