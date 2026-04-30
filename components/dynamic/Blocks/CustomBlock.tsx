'use client'

import type { BlockDefinition } from '../types'

export interface CustomFieldSchema {
  key: string
  label: string
  type: 'text' | 'textarea' | 'color' | 'boolean' | 'number' | 'url'
}

function CustomBlockComponent(props: Record<string, unknown>) {
  const template = (props.__template as string) ?? ''
  const schema = (props.__schema as CustomFieldSchema[]) ?? []

  if (!template) {
    return (
      <div
        className="bg-base-300"
        style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '2px dashed oklch(var(--p) / 0.2)',
        }}
      >
        <p style={{ color: 'oklch(var(--p) / 0.6)', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
          Custom Block
        </p>
        <p style={{ color: 'oklch(var(--bc) / 0.3)', fontSize: 12 }}>
          Select this block and open the Block Builder to define fields and HTML template.
        </p>
      </div>
    )
  }

  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const field = schema.find((f) => f.key === key)
    if (field?.type === 'boolean') {
      return props[key] ? 'true' : 'false'
    }
    const val = props[key]
    return val !== undefined && val !== null ? String(val) : ''
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

export const CustomBlockDefinition: BlockDefinition = {
  type: 'custom',
  label: 'Custom Block',
  description: 'Write your own HTML template with custom fields',
  category: 'Custom',
  defaultProps: {
    __schema: [],
    __template: '',
  },
  schema: {},
  Component: CustomBlockComponent,
}
