'use client'

import type { BlockDefinition } from '../types'

interface Benefit {
  icon: string
  title: string
  description: string
}

function BenefitsGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '3'
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  //const accent = (rawProps.accentColor as string) || '#ffc418'

  let benefits: Benefit[] = []
  try {
    const raw = rawProps.benefits
    benefits = typeof raw === 'string' ? JSON.parse(raw) : (raw as Benefit[]) ?? []
  } catch {
    benefits = []
  }

  const gridCols =
    columns === '2' ? 'md:grid-cols-2' : columns === '4' ? 'md:grid-cols-4' : 'md:grid-cols-3'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className={`grid ${gridCols} gap-8`}>
          {benefits.map((benefit, i) => (
            <div
              key={i}
              className="rounded-lg p-8 text-center hover:shadow-lg transition hover:-translate-y-1"
              style={{ backgroundColor: cardBg }}
            >
              <div className="text-5xl mb-4">{benefit.icon}</div>
              <h3 className="text-xl text-white font-bold mb-3">{benefit.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const BenefitsGridBlockDefinition: BlockDefinition = {
  type: 'BenefitsGridBlock',
  label: 'Benefits Grid',
  category: 'Features',
  description: 'Display benefits in a customizable grid.',
  defaultProps: {
    heading: 'Key Benefits',
    subtitle: 'Why choose our solution',
    columns: '3',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    benefits: JSON.stringify([
      {
        icon: '⚡',
        title: 'Fast & Reliable',
        description: 'Lightning-fast performance with 99.9% uptime',
      },
      {
        icon: '🔒',
        title: 'Secure',
        description: 'Enterprise-grade security and compliance',
      },
      {
        icon: '🎯',
        title: 'Easy to Use',
        description: 'Intuitive interface that anyone can master',
      },
      {
        icon: '📊',
        title: 'Data-Driven',
        description: 'Powerful analytics and insights',
      },
      {
        icon: '🌍',
        title: 'Global Scale',
        description: 'Available in 150+ countries',
      },
      {
        icon: '🤝',
        title: '24/7 Support',
        description: 'Always here to help you succeed',
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    benefits: { label: 'Benefits (JSON)', type: 'json' },
  },
  Component: BenefitsGridBlock,
}

export default BenefitsGridBlock
