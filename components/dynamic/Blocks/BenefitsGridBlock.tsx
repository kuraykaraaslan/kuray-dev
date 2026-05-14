'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Benefit {
  icon: string
  title: string
  description: string
}

const COLS: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-4',
}

function parseBenefits(raw: unknown): Benefit[] {
  if (Array.isArray(raw)) return raw as Benefit[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function BenefitsGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '3'
  const benefits = parseBenefits(rawProps.benefits)
  const gridCols = COLS[columns] ?? 'md:grid-cols-3'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid grid-cols-1 ${gridCols} gap-8`}>
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="bg-base-300 rounded-lg p-8 text-center hover:shadow-lg transition hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl text-base-content font-bold mb-3">{benefit.title}</h3>
              <p className="text-base-content/70">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const BenefitsGridBlockDefinition: BlockDefinition = {
  type: 'BenefitsGridBlock',
  label: 'Benefits Grid',
  category: 'Features',
  description: 'Display benefits in a customizable grid.',
  defaultProps: {
    heading: 'Key Benefits',
    subtitle: 'Why choose our solution',
    columns: '3',
    benefits: [
      { icon: '⚡', title: 'Fast & Reliable', description: 'Lightning-fast performance with 99.9% uptime' },
      { icon: '🔒', title: 'Secure', description: 'Enterprise-grade security and compliance' },
      { icon: '🎯', title: 'Easy to Use', description: 'Intuitive interface that anyone can master' },
      { icon: '📊', title: 'Data-Driven', description: 'Powerful analytics and insights' },
      { icon: '🌍', title: 'Global Scale', description: 'Available in 150+ countries' },
      { icon: '🤝', title: '24/7 Support', description: 'Always here to help you succeed' },
    ],
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-100',
    sectionId: 'benefits',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    benefits: {
      label: 'Benefits',
      type: 'repeater',
      fields: {
        icon:        { label: 'Icon (emoji)', type: 'text',     value: '⭐' },
        title:       { label: 'Title',        type: 'text',     value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: BenefitsGridBlock as unknown as BlockDefinition['Component'],
}

export default BenefitsGridBlock
