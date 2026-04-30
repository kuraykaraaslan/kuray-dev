'use client'

import Link from 'next/link'
import { ImageWithFallback } from '@/components/frontend/ImageWithFallback'
import type { BlockDefinition } from '../types'

// Matches WhyAvantLeap:
//   - Top centered tagline (two lines)
//   - Two-column: left = audience list + description + CTA, right = image

function WhyUsBlock(rawProps: Record<string, unknown>) {
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
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let items: string[] = []
  try {
    const raw = rawProps.items
    items = typeof raw === 'string' ? JSON.parse(raw) : (raw as string[]) ?? []
  } catch {
    items = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
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
              <p className="text-xl max-w-3xl mx-auto" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
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
                  <> <span style={{ color: accent }}>{sectionTitleAccent}</span></>
                )}
              </h3>
            )}

            {items.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mb-8">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-lg"
                    style={{ backgroundColor: cardBg }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    <p className="font-medium" style={{ color: 'oklch(var(--bc) / 0.9)' }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {description && (
              <p className="leading-relaxed mb-6" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {description}
              </p>
            )}

            {ctaLabel && (
              <Link
                href={ctaHref}
                className={`inline-block px-8 py-4 rounded-md text-lg font-medium transition-all hover:scale-105{!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}
              >
                {ctaLabel}
              </Link>
            )}
          </div>

          {/* Right: image */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            {imageUrl ? (
              <>
                <ImageWithFallback
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                  style={{ opacity: 0.5 }}
                />
                <div
                  className="absolute inset-0 border-2 rounded-lg"
                  style={{ borderColor: accent, opacity: 0.2 }}
                />
              </>
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  backgroundColor: 'oklch(var(--bc) / 0.04)',
                  border: '1px dashed oklch(var(--bc) / 0.1)',
                }}
              >
                <span className="text-sm" style={{ color: 'oklch(var(--bc) / 0.2)' }}>
                  Image URL not set
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const defaultItems = [
  'Large A&E Firms',
  'Asset Owners',
  'Infrastructure Projects',
  'Global Mega-Projects',
  'Developers',
  'Government Entities',
]

export const WhyUsBlockDefinition: BlockDefinition = {
  type: 'WhyUsBlock',
  label: 'Why Us (Audience + Image)',
  category: 'Content',
  description:
    'Two-part section: top centered tagline + two-column audience list with image — used in "Why Kuray Karaaslan"',
  defaultProps: {
    heading: 'Not a Software Reseller.',
    heading2: 'Not a Generic Consultant.',
    subtitle:
      'We are technology-agnostic, not tool-dependent — combining AI, Digital Twins, and human expertise into one execution mindset.',
    sectionTitle: 'Built for Complex',
    sectionTitleAccent: 'AECO Environments',
    items: JSON.stringify(defaultItems),
    description:
      "Kuray Karaaslan works with global decision-makers in complex environments. If your projects involve multiple teams, massive data flows, tight timelines, and zero margin for error — we're built for you.",
    ctaLabel: 'Talk to an Expert',
    ctaHref: '/contact',
    imageUrl:
      'https://images.unsplash.com/photo-1692613018920-e7e17813da9e?auto=format&fit=crop&w=1080&q=80',
    imageAlt: 'Architectural technology visualization',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
  },
  schema: {
    heading: { label: 'Top Heading Line 1', type: 'text' },
    heading2: { label: 'Top Heading Line 2', type: 'text' },
    subtitle: { label: 'Top Subtitle', type: 'textarea' },
    sectionTitle: { label: 'Section Title (white)', type: 'text' },
    sectionTitleAccent: { label: 'Section Title Accent (yellow)', type: 'text' },
    items: { label: 'Audience Items (JSON string array)', type: 'json' },
    description: { label: 'Description paragraph', type: 'textarea' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    imageUrl: { label: 'Image', type: 'img', uploadFolder: 'content', accept: 'image/jpeg,image/png,image/webp,image/avif' },
    imageAlt: { label: 'Image Alt', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: WhyUsBlock,
}

export default WhyUsBlock
