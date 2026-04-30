'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface Integration {
  name: string
  icon?: string
  description?: string
  href?: string
}

function IntegrationsBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  //const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let integrations: Integration[] = []
  try {
    const raw = rawProps.integrations
    integrations = typeof raw === 'string' ? JSON.parse(raw) : (raw as Integration[]) ?? []
  } catch {
    integrations = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-4 gap-8">
          {integrations.map((integration, i) => {
            const content = (
              <div
                className="rounded-lg p-8 text-center hover:shadow-lg transition flex flex-col justify-center items-center min-h-32"
                style={{ backgroundColor: cardBg }}
              >
                {integration.icon && <div className="text-5xl mb-4">{integration.icon}</div>}
                <h3 className="text-lg text-base-content font-bold">{integration.name}</h3>
                {integration.description && (
                  <p className="text-sm mt-2" style={{ color: 'oklch(var(--bc) / 0.6)' }}>
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
    </section>
  )
}

export const IntegrationsBlockDefinition: BlockDefinition = {
  type: 'IntegrationsBlock',
  label: 'Integrations',
  category: 'Features',
  description: 'Showcase available integrations.',
  defaultProps: {
    heading: 'Integrations',
    subtitle: 'Works seamlessly with your favorite tools',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    integrations: JSON.stringify([
      { name: 'Slack', icon: '💬', description: 'Real-time notifications' },
      { name: 'Zapier', icon: '⚡', description: 'Automation workflows' },
      { name: 'Stripe', icon: '💳', description: 'Payment processing' },
      { name: 'GitHub', icon: '🐙', description: 'Code management' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    integrations: { label: 'Integrations (JSON)', type: 'json' },
  },
  Component: IntegrationsBlock,
}

export default IntegrationsBlock
