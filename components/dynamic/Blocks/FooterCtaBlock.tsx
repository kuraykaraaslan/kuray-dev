'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function FooterCtaBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="text-center rounded-2xl p-10 bg-base-200">
          {heading && (
            <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
          )}
          {subtitle && (
            <p className="text-lg mb-8 text-base-content/70">
              {subtitle}
            </p>
          )}
          {ctaLabel && (
            <Link
              href={ctaHref}
              className="btn btn-primary px-8 py-3 text-base font-medium hover:scale-105 transition-transform"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const FooterCtaBlockDefinition: BlockDefinition = {
  type: 'FooterCtaBlock',
  label: 'Footer CTA',
  category: 'CTA',
  description: 'Final call to action near the footer with a centered card.',
  defaultProps: {
    heading: 'Ready to move faster?',
    subtitle: 'Talk to our team about enterprise deployment options.',
    ctaLabel: 'Contact Sales',
    ctaHref: '/contact',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'footer-cta',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ctaLabel: { label: 'CTA Button Label', type: 'text' },
    ctaHref: { label: 'CTA Button URL', type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: FooterCtaBlock as unknown as BlockDefinition['Component'],
}

export default FooterCtaBlock
