'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ValueItem {
  title: string
  description: string
}

function ValuesGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let values: ValueItem[] = []
  try {
    const raw = rawProps.values
    values = typeof raw === 'string' ? JSON.parse(raw) : (raw as ValueItem[]) ?? []
  } catch {
    values = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
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

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, i) => (
            <div key={i} className="rounded-lg p-6 bg-base-200">
              <h3 className="text-2xl text-base-content font-bold mb-3">{value.title}</h3>
              <p className="text-base-content/70">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ValuesGridBlockDefinition: BlockDefinition = {
  type: 'ValuesGridBlock',
  label: 'Values Grid',
  category: 'Company',
  description: 'Communicate company values or principles.',
  defaultProps: {
    heading: 'What We Stand For',
    subtitle: 'Principles that guide how we build and support products',
    values: JSON.stringify([
      { title: 'Clarity', description: 'Clear interfaces, clear processes, clear outcomes.' },
      { title: 'Reliability', description: 'Systems that are dependable under real enterprise load.' },
      { title: 'Partnership', description: 'We work with customers like an extension of their team.' },
    ]),
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-300',
    sectionId: 'values-grid',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text', value: 'What We Stand For' },
    subtitle: { label: 'Subtitle', type: 'text', value: 'Principles that guide how we build and support products' },
    values: {
      label: 'Values',
      type: 'repeater',
      fields: {
        title:       { label: 'Title',       type: 'text',     value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ValuesGridBlock as unknown as BlockDefinition['Component'],
}

export default ValuesGridBlock
