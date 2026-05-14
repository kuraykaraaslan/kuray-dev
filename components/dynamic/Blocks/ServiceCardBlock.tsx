'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ServiceCard {
  icon?: string
  title: string
  description: string
  href?: string
}

const DEFAULT_SERVICES: ServiceCard[] = [
  { icon: '⚙️', title: 'Automation', description: 'Reduce manual work with workflow automation.', href: '/services/automation' },
  { icon: '🔐', title: 'Security', description: 'Protect your data and users with enterprise controls.', href: '/services/security' },
  { icon: '📈', title: 'Analytics', description: 'Measure performance with actionable dashboards.', href: '/services/analytics' },
]

function parseServices(raw: unknown): ServiceCard[] {
  if (Array.isArray(raw)) return raw as ServiceCard[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_SERVICES
}

function ServiceCardBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const services = parseServices(rawProps.services)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const content = (
              <div className="bg-base-200 rounded-lg p-8 hover:-translate-y-1 transition">
                {service.icon && (
                  <div className="text-4xl mb-4">{service.icon}</div>
                )}
                <h3 className="text-2xl text-base-content font-bold mb-3">{service.title}</h3>
                <p className="text-base-content/70">{service.description}</p>
              </div>
            )

            return service.href ? (
              <Link key={i} href={service.href}>
                {content}
              </Link>
            ) : (
              <div key={i}>{content}</div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ServiceCardBlockDefinition: BlockDefinition = {
  type: 'ServiceCardBlock',
  label: 'Service Cards',
  category: 'Features',
  description: 'Show services or solutions as cards.',
  defaultProps: {
    heading: 'Our Services',
    subtitle: 'Everything your enterprise needs in one place',
    services: DEFAULT_SERVICES,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'services',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    services: {
      label: 'Services',
      type: 'repeater',
      fields: {
        icon:        { label: 'Icon (emoji)', type: 'text',     value: '⚙️' },
        title:       { label: 'Title',        type: 'text',     value: '' },
        description: { label: 'Description',  type: 'textarea', value: '' },
        href:        { label: 'Link URL',      type: 'url',      value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ServiceCardBlock as unknown as BlockDefinition['Component'],
}

export default ServiceCardBlock
