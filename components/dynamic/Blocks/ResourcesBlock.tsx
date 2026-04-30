'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface Resource {
  title: string
  description?: string
  icon?: string
  type?: string
  href: string
}

function ResourcesBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let resources: Resource[] = []
  try {
    const raw = rawProps.resources
    resources = typeof raw === 'string' ? JSON.parse(raw) : (raw as Resource[]) ?? []
  } catch {
    resources = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
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

        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <Link
              key={i}
              href={resource.href}
              className="rounded-lg p-8 hover:shadow-lg transition hover:-translate-y-1"
              style={{ backgroundColor: cardBg }}
            >
              <div className="flex items-start justify-between mb-4">
                {resource.icon && <span className="text-3xl">{resource.icon}</span>}
                {resource.type && (
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full{!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}
                  >
                    {resource.type}
                  </span>
                )}
              </div>
              <h3 className="text-lg text-base-content font-bold mb-2">{resource.title}</h3>
              {resource.description && (
                <p style={{ color: 'oklch(var(--bc) / 0.6)' }}>{resource.description}</p>
              )}
              <div className="mt-4 font-semibold" style={{ color: accent }}>
                Learn More →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
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
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    resources: JSON.stringify([
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
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    resources: { label: 'Resources (JSON)', type: 'json' },
  },
  Component: ResourcesBlock,
}

export default ResourcesBlock
