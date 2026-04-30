'use client'

import type { BlockDefinition } from '../types'

interface Feature {
  icon: string
  title: string
  description: string
}

function FeatureGrid(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const cols = (rawProps.columns as string) || '3'
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let features: Feature[] = []
  try {
    const raw = rawProps.features
    if (typeof raw === 'string') {
      features = JSON.parse(raw)
    } else if (Array.isArray(raw)) {
      features = raw as Feature[]
    }
  } catch {
    features = []
  }

  const gridCols =
    cols === '2'
      ? 'md:grid-cols-2'
      : cols === '4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2 lg:grid-cols-3'

  return (
    <section className="px-6 md:px-12 lg:px-20 py-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg max-w-2xl mx-auto" style={{ color: 'oklch(var(--bc) / 0.65)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-lg border-t-2 bg-base-300"
              style={{ borderTopColor: accent || 'oklch(var(--p))' }}
            >
              {feature.icon && <div className="text-3xl mb-4">{feature.icon}</div>}
              <h3 className="text-xl text-base-content mb-3">{feature.title}</h3>
              <p style={{ color: 'oklch(var(--bc) / 0.6)' }} className="text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultFeatures: Feature[] = [
  {
    icon: '⚡',
    title: 'Fast Integration',
    description: 'Connect to your workflow in minutes with our simple API.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Enterprise-grade security built into every layer.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    description: 'Monitor performance and insights from your dashboard.',
  },
]

export const FeatureGridDefinition: BlockDefinition = {
  type: 'FeatureGrid',
  label: 'Feature Grid',
  category: 'Content',
  description: 'Grid of feature cards with icon, title and description',
  defaultProps: {
    heading: 'Key Features',
    subtitle: 'Everything you need to accelerate your workflow.',
    columns: '3',
    features: JSON.stringify(defaultFeatures, null, 2),
    bgColor: '',
    accentColor: '',
  },
  schema: {
    heading: { label: 'Section Title', type: 'text', placeholder: 'Key Features' },
    subtitle: { label: 'Subtitle', type: 'textarea', placeholder: 'Section subtitle...' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    features: {
      label: 'Features (JSON array)',
      type: 'json',
      placeholder: '[{"icon":"⚡","title":"Feature","description":"Description"}]',
    },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: FeatureGrid,
}

export default FeatureGrid
