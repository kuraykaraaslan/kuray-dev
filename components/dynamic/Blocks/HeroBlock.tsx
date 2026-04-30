'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

// Matches the centered hero used on /products and /solutions pages:
//   - Optional small tagline above title
//   - Two-line title: white line + yellow accent line
//   - Subtitle text
//   - Single CTA button

function HeroBlock(rawProps: Record<string, unknown>) {
  const tagline = rawProps.tagline as string | undefined
  const title = (rawProps.title as string) || 'Your Title'
  const titleAccent = rawProps.titleAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  return (
    <section className="px-6 md:px-12 lg:px-20 py-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto text-center">
        {tagline && (
          <p className="text-sm font-medium mb-4" style={{ color: accent }}>
            {tagline}
          </p>
        )}

        <h1 className="text-5xl md:text-6xl text-white mb-6 leading-tight">
          {title}
          {titleAccent && (
            <>
              <br />
              <span style={{ color: accent }}>{titleAccent}</span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className="text-xl max-w-3xl mx-auto mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <Link
            href={ctaHref}
            className="inline-block px-10 py-4 rounded-md text-lg font-medium hover:scale-105 transition-transform"
            style={{ backgroundColor: accent, color: bg }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const HeroBlockDefinition: BlockDefinition = {
  type: 'HeroBlock',
  label: 'Hero — Centered',
  category: 'Hero',
  description: 'Centered hero with two-line title, subtitle and a single CTA button',
  defaultProps: {
    tagline: '',
    title: 'Tools Built for',
    titleAccent: 'the AECO Industry',
    subtitle:
      'Explore our full suite of AI-powered tools — designed to automate, accelerate, and elevate every stage of your project.',
    ctaLabel: 'Request a Demo',
    ctaHref: '/contact',
    bgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    tagline: { label: 'Tagline (above title)', type: 'text', placeholder: 'Optional small label' },
    title: { label: 'Title (white line)', type: 'text', placeholder: 'Tools Built for' },
    titleAccent: {
      label: 'Title Accent (yellow line)',
      type: 'text',
      placeholder: 'the AECO Industry',
    },
    subtitle: { label: 'Subtitle', type: 'textarea', placeholder: 'Describe your value...' },
    ctaLabel: { label: 'Button Label', type: 'text', placeholder: 'Request a Demo' },
    ctaHref: { label: 'Button URL', type: 'url', placeholder: '/contact' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: HeroBlock,
}

export default HeroBlock
