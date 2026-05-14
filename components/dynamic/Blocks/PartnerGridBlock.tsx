'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface PartnerItem {
  name: string
  description?: string
  icon?: string
}

function parsePartners(raw: unknown): PartnerItem[] {
  if (Array.isArray(raw)) return raw as PartnerItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function PartnerGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const partners = parsePartners(rawProps.partners)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {partners.map((partner, i) => (
            <div key={i} className="rounded-lg p-6 bg-base-200">
              <div className="flex items-center gap-4 mb-3">
                {partner.icon && <span className="text-3xl">{partner.icon}</span>}
                <h3 className="text-2xl text-base-content font-bold">{partner.name}</h3>
              </div>
              {partner.description && (
                <p className="text-base-content/70">{partner.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const PartnerGridBlockDefinition: BlockDefinition = {
  type: 'PartnerGridBlock',
  label: 'Partner Grid',
  category: 'Social Proof',
  description: 'Display strategic partners or channel partners.',
  defaultProps: {
    heading: 'Partner Ecosystem',
    subtitle: 'Trusted collaborators and integrations',
    partners: [
      { name: 'Cloud Partners',        icon: '☁️', description: 'Infrastructure and hosting partners'       },
      { name: 'System Integrators',    icon: '🔧', description: 'Implementation and services partners'      },
      { name: 'Technology Alliances',  icon: '🤝', description: 'Platform and product partnerships'         },
    ],
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-100',
    sectionId: 'partners',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:  { label: 'Heading',  type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    partners: {
      label: 'Partners',
      type: 'repeater',
      fields: {
        icon:        { label: 'Icon (emoji)', type: 'text',     value: '🤝' },
        name:        { label: 'Name',         type: 'text',     value: '' },
        description: { label: 'Description',  type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: PartnerGridBlock as unknown as BlockDefinition['Component'],
}

export default PartnerGridBlock
