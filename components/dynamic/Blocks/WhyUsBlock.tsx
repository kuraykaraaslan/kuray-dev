'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Two-part section:
//   - Top centered tagline (heading + heading2 + subtitle)
//   - Two-column: left = audience list + description + CTA, right = image

function WhyUsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const heading = rawProps.heading as string | undefined
  const heading2 = rawProps.heading2 as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const sectionTitle = rawProps.sectionTitle as string | undefined
  const sectionTitleAccent = rawProps.sectionTitleAccent as string | undefined
  const description = rawProps.description as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = (rawProps.imageAlt as string) || ''

  let items: string[] = []
  try {
    const raw = rawProps.items
    const arr: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown[]) ?? []
    items = arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
  } catch {
    items = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="max-w-7xl mx-auto">
        {/* Top tagline */}
        {(heading || heading2 || subtitle) && (
          <div className="text-center mb-20">
            {(heading || heading2) && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-6">
                {heading && heading}
                {heading && heading2 && <br />}
                {heading2 && heading2}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl max-w-3xl mx-auto text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Two-column */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            {(sectionTitle || sectionTitleAccent) && (
              <h3 className="text-3xl text-base-content mb-8">
                {sectionTitle}
                {sectionTitleAccent && (
                  <> <span className="text-primary">{sectionTitleAccent}</span></>
                )}
              </h3>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-lg bg-base-200"
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
                    <p className="font-medium text-base-content">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {description && (
              <p className="leading-relaxed mb-6 text-base-content/70">
                {description}
              </p>
            )}

            {ctaLabel && (
              <Link
                href={ctaHref}
                className="btn btn-primary inline-block px-8 py-4 text-lg font-medium transition-all hover:scale-105"
              >
                {ctaLabel}
              </Link>
            )}
          </div>

          {/* Right: image */}
          <div className="relative h-96 rounded-lg overflow-hidden">
            {imageUrl ? (
              <>
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 border-2 rounded-lg border-primary opacity-20" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-200 border border-dashed border-base-content/10">
                <span className="text-sm text-base-content/20">
                  Image URL not set
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

const defaultItems = [
  'Enterprises',
  'Startups',
  'Tech Teams',
  'Global Projects',
  'Developers',
  'Organizations',
]

export const WhyUsBlockDefinition: BlockDefinition = {
  type: 'WhyUsBlock',
  label: 'Why Us (Audience + Image)',
  category: 'Content',
  description:
    'Two-part section: top centered tagline + two-column audience list with image',
  defaultProps: {
    heading: 'Not a Software Reseller.',
    heading2: 'Not a Generic Consultant.',
    subtitle:
      'We are technology-agnostic, not tool-dependent — combining expertise and human insight into one execution mindset.',
    sectionTitle: 'Built for Complex',
    sectionTitleAccent: 'Environments',
    items: defaultItems.map(text => ({ text })),
    description:
      "We work with global decision-makers in complex environments. If your projects involve multiple teams, massive data flows, tight timelines, and zero margin for error — we're built for you.",
    ctaLabel: 'Talk to an Expert',
    ctaHref: '/contact',
    imageUrl:
      'https://images.unsplash.com/photo-1692613018920-e7e17813da9e?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Technology visualization',
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-100',
    sectionId: 'why-us',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Top Heading Line 1', type: 'text' },
    heading2: { label: 'Top Heading Line 2', type: 'text' },
    subtitle: { label: 'Top Subtitle', type: 'textarea' },
    sectionTitle: { label: 'Section Title', type: 'text' },
    sectionTitleAccent: { label: 'Section Title Accent', type: 'text' },
    items: {
      label: 'Audience Items',
      type: 'repeater',
      fields: { text: { label: 'Item', type: 'text', value: '' } },
    },
    description: { label: 'Description paragraph', type: 'textarea' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    imageUrl: { label: 'Image', type: 'img', uploadFolder: 'content', accept: 'image/jpeg,image/png,image/webp,image/avif' },
    imageAlt: { label: 'Image Alt', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: WhyUsBlock as unknown as BlockDefinition['Component'],
}

export default WhyUsBlock
