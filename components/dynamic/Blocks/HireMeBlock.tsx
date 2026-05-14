'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNodes } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../BaseBlock'
import type { BlockDefinition } from '../types'

function HireMeBlock(rawProps: Record<string, unknown>) {
  const heading     = (rawProps.heading as string)     || 'Hire Me'
  const description = (rawProps.description as string) || 'I am available for freelance projects worldwide.'
  const ctaLabel    = (rawProps.ctaLabel as string)    || 'View My Services'
  const ctaHref     = (rawProps.ctaHref as string)     || '#services'
  const baseProps = parseBaseBlockProps(rawProps)

  return (
    <BaseBlock as="div" {...baseProps} className="bg-base-200 min-h-screen">
      <div
        className="hero min-h-screen select-none"
        style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
      >
        <div className="hero-content text-center max-w-2xl">
          <div>
            <h2 className="text-5xl font-bold">{heading}</h2>
            <p className="py-6 text-lg">{description}</p>
            <Link className="btn btn-primary" href={ctaHref}>
              <FontAwesomeIcon icon={faCircleNodes} className="w-5 h-5" />
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const HireMeBlockDefinition: BlockDefinition = {
  type: 'HireMeBlock',
  label: 'Hire Me Hero',
  description: 'Full-screen hero with configurable background and freelance CTA.',
  category: 'Hero',
  defaultProps: {
    heading: 'Hire Me',
    description: 'I am available for freelance projects worldwide.',
    ctaLabel: 'View My Services',
    ctaHref: '#services',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:     { label: 'Heading',      type: 'text' },
    description: { label: 'Description',  type: 'textarea' },
    ctaLabel:    { label: 'Button Label', type: 'text' },
    ctaHref:     { label: 'Button URL',   type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HireMeBlock as unknown as BlockDefinition['Component'],
}

export default HireMeBlock
