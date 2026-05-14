'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Feature {
  icon: string
  title: string
  description: string
}

const GRID_COLS: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

function FeatureGrid(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const cols = (rawProps.columns as string) || '3'

  let features: Feature[] = []
  try {
    const raw = rawProps.features
    if (Array.isArray(raw)) {
      features = (raw as Record<string, unknown>[]).map((item) => ({
        icon: (item.icon as string) || '',
        title: (item.title as string) || '',
        description: (item.description as string) || '',
      }))
    } else if (typeof raw === 'string') {
      features = JSON.parse(raw)
    }
  } catch {
    features = []
  }

  const gridCols = GRID_COLS[cols] ?? GRID_COLS['3']

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl mb-4 text-base-content">
                {heading}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg max-w-2xl mx-auto text-base-content/65">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {features.map((feature, i) => (
            <div
              key={i}
              className="p-8 rounded-lg border-t-2 bg-base-200 border-t-primary"
            >
              {feature.icon && (
                <div className="text-3xl mb-4">{feature.icon}</div>
              )}
              <h3 className="text-xl mb-3 text-base-content">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-base-content/60">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    features: defaultFeatures,
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Section Title', type: 'text', placeholder: 'Key Features' },
    subtitle: { label: 'Subtitle', type: 'textarea', placeholder: 'Section subtitle...' },
    columns: {
      label: 'Columns',
      type: 'select',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    features: {
      label: 'Features',
      type: 'repeater',
      fields: {
        icon: { label: 'Icon (emoji or text)', type: 'text', value: '⚡', placeholder: '⚡' },
        title: { label: 'Title', type: 'text', value: '', placeholder: 'Feature title' },
        description: { label: 'Description', type: 'textarea', value: '', placeholder: 'Feature description' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: FeatureGrid as unknown as BlockDefinition['Component'],
}

export default FeatureGrid
