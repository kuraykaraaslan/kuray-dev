'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function FooterCtaBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto text-center rounded-2xl p-10 bg-base-300">
        {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
        {subtitle && <p className="text-lg mb-8" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className={`inline-block px-8 py-3 rounded-md font-medium${!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const FooterCtaBlockDefinition: BlockDefinition = {
  type: 'FooterCtaBlock',
  label: 'Footer CTA',
  category: 'Forms',
  description: 'Final call to action near the footer.',
  defaultProps: {
    heading: 'Ready to move faster?',
    subtitle: 'Talk to our team about enterprise deployment options.',
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
    bgColor: '',
    accentColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref: { label: 'CTA Link', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: FooterCtaBlock,
}

export default FooterCtaBlock