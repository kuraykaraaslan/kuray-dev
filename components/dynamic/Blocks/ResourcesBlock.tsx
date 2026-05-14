'use client'

import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Resource {
  title: string
  description?: string
  icon?: string
  type?: string
  href: string
}

const COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function ResourcesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = Math.min(4, Math.max(1, Number(rawProps.columns) || 3)) as 1 | 2 | 3 | 4

  let resources: Resource[] = []
  try {
    const raw = rawProps.resources
    resources = typeof raw === 'string' ? JSON.parse(raw) : (raw as Resource[]) ?? []
  } catch {
    resources = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-16">
              {heading && <h2 className="text-4xl md:text-5xl mb-4 text-base-content">{heading}</h2>}
              {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
            </div>
          )}

          <div className={`grid md:${COLS[columns]} gap-6`}>
            {resources.map((resource, i) => (
              <Link
                key={i}
                href={resource.href || '#'}
                className="rounded-lg p-8 hover:shadow-lg transition hover:-translate-y-1 bg-base-200"
              >
                <div className="flex items-start justify-between mb-4">
                  {resource.icon && <span className="text-3xl">{resource.icon}</span>}
                  {resource.type && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary text-primary-content">
                      {resource.type}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold mb-2 text-base-content">{resource.title}</h3>
                {resource.description && (
                  <p className="text-base-content/60">{resource.description}</p>
                )}
                <div className="mt-4 font-semibold text-primary">
                  Learn More &rarr;
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const ResourcesBlockDefinition: BlockDefinition = {
  type: 'ResourcesBlock',
  label: 'Resources',
  category: 'Content',
  description: 'Display resources, guides, and documentation links.',
  defaultProps: {
    heading: 'Resources & Documentation',
    subtitle: 'Everything you need to get started',
    columns: 3,
    blockClass: 'bg-base-300',
    sectionId: '',
    resources: [
      {
        title: 'Getting Started Guide',
        description: 'Learn the basics in 10 minutes',
        icon: '📚',
        type: 'Guide',
        href: '/docs/getting-started',
      },
      {
        title: 'API Documentation',
        description: 'Complete API reference and examples',
        icon: '⚙️',
        type: 'Docs',
        href: '/docs/api',
      },
      {
        title: 'Video Tutorials',
        description: 'Step-by-step video guides',
        icon: '🎥',
        type: 'Videos',
        href: '/tutorials',
      },
    ],
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    columns: { label: 'Columns', type: 'number', min: 1, max: 4, value: 3 },
    resources: {
      label: 'Resources',
      type: 'repeater',
      fields: {
        icon: { label: 'Icon (emoji)', type: 'text', value: '' },
        type: { label: 'Badge Label', type: 'text', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
        href: { label: 'Link URL', type: 'url', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ResourcesBlock as unknown as BlockDefinition['Component'],
}

export default ResourcesBlock
