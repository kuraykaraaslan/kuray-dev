'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Matches TrustBar: horizontal pipe-separated audience/label list

function TrustBarBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const label = rawProps.label as string | undefined

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
      <div className="relative z-10 max-w-7xl mx-auto">
        {label && (
          <p className="text-center text-sm mb-6 uppercase tracking-widest text-base-content/50">
            {label}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-6 md:gap-10">
              <span className="text-sm md:text-base font-medium text-base-content/70">
                {item}
              </span>
              {i < items.length - 1 && (
                <div className="w-px h-5 bg-primary opacity-40" />
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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

export const TrustBarBlockDefinition: BlockDefinition = {
  type: 'TrustBarBlock',
  label: 'Trust Bar',
  category: 'Trust & Social Proof',
  description: 'Horizontal pipe-separated list of audience types or trust signals',
  defaultProps: {
    label: 'Built for Complex AECO Environments',
    items: defaultItems.map(text => ({ text })),
    blockClass: 'py-8 px-6 md:px-12 lg:px-20 bg-base-300',
    sectionId: 'trust-bar',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    label: {
      label: 'Label above items',
      type: 'text',
      value: 'Built for Complex AECO Environments',
      placeholder: 'Built for...',
    },
    items: {
      label: 'Items',
      type: 'repeater',
      fields: { text: { label: 'Item', type: 'text', value: '' } },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TrustBarBlock as unknown as BlockDefinition['Component'],
}

export default TrustBarBlock
