'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Centered hero with optional tagline, two-line title (base-content + primary), subtitle, and a single CTA button.

function HeroBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const tagline = rawProps.tagline as string | undefined
  const title = (rawProps.title as string) || 'Your Title'
  const titleAccent = rawProps.titleAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20 text-center">
        {tagline && (
          <p className="text-sm font-medium mb-4 text-primary">
            {tagline}
          </p>
        )}

        <h1 className="text-5xl md:text-6xl mb-6 leading-tight text-base-content">
          {title}
          {titleAccent && (
            <>
              <br />
              <span className="text-primary">{titleAccent}</span>
            </>
          )}
        </h1>

        {subtitle && (
          <p className="text-xl max-w-3xl mx-auto mb-10 text-base-content/70">
            {subtitle}
          </p>
        )}

        {ctaLabel && (
          <Link
            href={ctaHref}
            className="btn btn-primary px-10 py-4 text-lg font-medium hover:scale-105 transition-transform"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </BaseBlock>
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
    titleAccent: 'the Modern Developer',
    subtitle:
      'Explore our full suite of tools — designed to automate, accelerate, and elevate every stage of your project.',
    ctaLabel: 'Get Started',
    ctaHref: '/contact',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'hero',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    tagline: { label: 'Tagline (above title)', type: 'text', placeholder: 'Optional small label' },
    title: { label: 'Title (main line)', type: 'text', placeholder: 'Tools Built for' },
    titleAccent: {
      label: 'Title Accent (second line, primary color)',
      type: 'text',
      placeholder: 'the Modern Developer',
    },
    subtitle: { label: 'Subtitle', type: 'textarea', placeholder: 'Describe your value...' },
    ctaLabel: { label: 'Button Label', type: 'text', placeholder: 'Get Started' },
    ctaHref: { label: 'Button URL', type: 'url', placeholder: '/contact' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HeroBlock as unknown as BlockDefinition['Component'],
}

export default HeroBlock
