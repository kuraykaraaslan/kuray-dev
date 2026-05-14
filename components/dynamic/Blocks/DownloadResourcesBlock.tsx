'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ResourceItem {
  title: string
  href: string
  description?: string
}

function parseResources(value: unknown): ResourceItem[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is ResourceItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as ResourceItem).title === 'string' &&
        typeof (item as ResourceItem).href === 'string',
    )
  } catch {
    return []
  }
}

function DownloadResourcesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  const resources = parseResources(rawProps.resources)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <Link
              key={i}
              href={resource.href}
              className="bg-base-200 rounded-lg p-6 hover:-translate-y-1 transition block"
            >
              <h3 className="text-xl text-base-content font-bold mb-2">{resource.title}</h3>
              {resource.description && (
                <p className="text-base-content/70">{resource.description}</p>
              )}
              <div className="mt-4 font-semibold text-primary">
                Download / View →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const DownloadResourcesBlockDefinition: BlockDefinition = {
  type: 'DownloadResourcesBlock',
  label: 'Download Resources',
  category: 'Content',
  description: 'Promote downloadable resources and documents.',
  defaultProps: {
    heading: 'Resources',
    subtitle: 'Guides, reports, and useful assets',
    resources: [
      { title: 'Security Whitepaper', href: '/resources/security-whitepaper', description: 'Enterprise security baseline and controls.' },
      { title: 'Platform Overview', href: '/resources/platform-overview', description: 'A concise overview of the product.' },
      { title: 'Implementation Guide', href: '/resources/implementation-guide', description: 'How to roll out successfully.' },
    ],
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'resources',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    resources: {
      label: 'Resources',
      type: 'repeater',
      fields: {
        title:       { label: 'Title',       type: 'text', value: '' },
        href:        { label: 'URL',         type: 'url',  value: '' },
        description: { label: 'Description', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: DownloadResourcesBlock as unknown as BlockDefinition['Component'],
}

export default DownloadResourcesBlock
