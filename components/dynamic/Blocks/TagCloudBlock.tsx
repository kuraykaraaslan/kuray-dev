'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

const DEFAULT_ITEMS = [
  'Multi-Discipline Clash Detection',
  'Linked Model Analysis',
  'JSON Database Management',
  'Model Version Comparison',
  'Coordination View Production',
  'Redline Change Reports',
]

function parseItems(raw: unknown): string[] {
  let arr: unknown[] = []
  if (Array.isArray(raw)) arr = raw
  else if (typeof raw === 'string') {
    try { arr = JSON.parse(raw) } catch { return DEFAULT_ITEMS }
  } else {
    return DEFAULT_ITEMS
  }
  return arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
}

function TagCloudBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const variant = (rawProps.variant as string) || 'pills'
  const items = parseItems(rawProps.items)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="mb-10">
            {heading && <h2 className="text-4xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        {variant === 'pills' ? (
          <div className="flex flex-wrap gap-3">
            {items.map((item, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full text-sm bg-base-200 border border-base-300 text-base-content/80"
              >
                {item}
              </span>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={i}
                className="p-6 rounded-lg border-l-4 border-primary bg-base-200 flex items-center gap-4"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
                <p className="text-base-content/90">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseBlock>
  )
}

export const TagCloudBlockDefinition: BlockDefinition = {
  type: 'TagCloudBlock',
  label: 'Tag Cloud / Capabilities',
  category: 'Content',
  description: 'Text items as pill badges or accent-border cards — for capabilities, strategies, initiatives.',
  defaultProps: {
    heading: 'Capabilities',
    subtitle: '',
    variant: 'pills',
    items: DEFAULT_ITEMS.map(text => ({ text })),
    blockClass: 'bg-base-200 py-4',
    sectionId: 'tag-cloud',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:  { label: 'Heading',  type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    variant:  { label: 'Style',    type: 'select', options: ['pills', 'cards'], value: 'pills' },
    items: {
      label: 'Items',
      type: 'repeater',
      fields: { text: { label: 'Item', type: 'text', value: '' } },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TagCloudBlock as unknown as BlockDefinition['Component'],
}

export default TagCloudBlock
