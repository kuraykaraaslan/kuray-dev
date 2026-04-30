'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

// Matches the CTA section: full-width yellow/accent banner with heading, subtitle, button

function CTABannerBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || "Let's talk."
  const subtitle = rawProps.subtitle as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'
  const bg = (rawProps.bgColor as string) || '#ffc418'
  const textColor = (rawProps.textColor as string) || '#282626'
  const btnBg = (rawProps.buttonBgColor as string) || '#282626'
  const btnText = (rawProps.buttonTextColor as string) || '#ffffff'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2
          className="text-4xl md:text-5xl mb-8 leading-tight"
          style={{ color: textColor }}
        >
          {heading}
        </h2>

        {subtitle && (
          <p className="text-xl mb-10 opacity-80" style={{ color: textColor }}>
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <Link
            href={ctaHref}
            className="inline-block px-10 py-5 rounded-md text-lg font-medium hover:scale-105 transition-transform"
            style={{ backgroundColor: btnBg, color: btnText }}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const CTABannerBlockDefinition: BlockDefinition = {
  type: 'CTABannerBlock',
  label: 'CTA Banner',
  category: 'CTA',
  description: 'Full-width call-to-action banner — yellow background by default',
  defaultProps: {
    heading:
      "If you're leading complex AECO initiatives and need clarity, alignment, and execution — let's talk.",
    subtitle: "Let's build the digital infrastructure your projects deserve.",
    ctaLabel: 'Talk to an Expert',
    ctaHref: '/contact',
    bgColor: '#ffc418',
    textColor: '#282626',
    buttonBgColor: '#282626',
    buttonTextColor: '#ffffff',
  },
  schema: {
    heading: { label: 'Heading', type: 'textarea' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
    textColor: { label: 'Text Color', type: 'color' },
    buttonBgColor: { label: 'Button Background', type: 'color' },
    buttonTextColor: { label: 'Button Text Color', type: 'color' },
  },
  Component: CTABannerBlock,
}

export default CTABannerBlock
