'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ChecklistItem {
  text: string
  done?: boolean
}

const DEFAULT_ITEMS: ChecklistItem[] = [
  { text: 'Security review completed',             done: true  },
  { text: 'Analytics events configured',           done: true  },
  { text: 'SSO enabled',                           done: true  },
  { text: 'Backup and rollback plan documented',   done: false },
]

function parseItems(raw: unknown): ChecklistItem[] {
  if (Array.isArray(raw)) return raw as ChecklistItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_ITEMS
}

function ChecklistBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const items = parseItems(rawProps.items)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-4xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="rounded-lg p-8 bg-base-200">
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={item.done === false ? 'text-base-content/40' : 'text-primary'}>
                  {item.done === false ? '◌' : '✓'}
                </span>
                <span className={item.done === false ? 'text-base-content/50' : 'text-base-content/85'}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BaseBlock>
  )
}

export const ChecklistBlockDefinition: BlockDefinition = {
  type: 'ChecklistBlock',
  label: 'Checklist',
  category: 'Content',
  description: 'Render a checklist for onboarding, security, or launch readiness.',
  defaultProps: {
    heading: 'Launch Checklist',
    subtitle: 'Everything covered before go-live',
    items: DEFAULT_ITEMS,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'checklist',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:  { label: 'Heading',  type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    items: {
      label: 'Items',
      type: 'repeater',
      fields: {
        text: { label: 'Text',  type: 'text',    value: '' },
        done: { label: 'Done?', type: 'boolean', value: true },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ChecklistBlock as unknown as BlockDefinition['Component'],
}

export default ChecklistBlock
