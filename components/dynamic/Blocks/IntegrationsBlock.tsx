'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Integration {
  name: string
  icon?: string
  description?: string
  href?: string
}

function parseIntegrations(raw: unknown): Integration[] {
  if (Array.isArray(raw)) return raw as Integration[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function IntegrationsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  const integrations = parseIntegrations(rawProps.integrations)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
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

          <div className="grid md:grid-cols-4 gap-8">
            {integrations.map((integration, i) => {
              const content = (
                <div
                  className="bg-base-200 rounded-lg p-8 text-center hover:shadow-lg transition flex flex-col justify-center items-center min-h-32"
                >
                  {integration.icon && (
                    <div className="text-5xl mb-4">{integration.icon}</div>
                  )}
                  <h3 className="text-lg text-base-content font-bold">{integration.name}</h3>
                  {integration.description && (
                    <p className="text-sm mt-2 text-base-content/60">
                      {integration.description}
                    </p>
                  )}
                </div>
              )

              return integration.href ? (
                <Link key={i} href={integration.href}>
                  {content}
                </Link>
              ) : (
                <div key={i}>{content}</div>
              )
            })}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const IntegrationsBlockDefinition: BlockDefinition = {
  type: 'IntegrationsBlock',
  label: 'Integrations',
  category: 'Features',
  description: 'Showcase available integrations as a grid of icon cards.',
  defaultProps: {
    heading: 'Integrations',
    subtitle: 'Works seamlessly with your favorite tools',
    integrations: [
      { name: 'Slack', icon: '💬', description: 'Real-time notifications' },
      { name: 'Zapier', icon: '⚡', description: 'Automation workflows' },
      { name: 'Stripe', icon: '💳', description: 'Payment processing' },
      { name: 'GitHub', icon: '🐙', description: 'Code management' },
    ],
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'integrations',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    integrations: {
      label: 'Integrations',
      type: 'repeater',
      fields: {
        name: { label: 'Name', type: 'text', value: '' },
        icon: { label: 'Icon (emoji)', type: 'text', value: '' },
        description: { label: 'Description', type: 'text', value: '' },
        href: { label: 'Link URL', type: 'url', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: IntegrationsBlock as unknown as BlockDefinition['Component'],
}

export default IntegrationsBlock
