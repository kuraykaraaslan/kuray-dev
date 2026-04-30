'use client'

import type { BlockDefinition } from '../types'

interface UseCase {
  industry: string
  icon?: string
  useCases: string[]
}

function IndustryUseCasesBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let industries: UseCase[] = []
  try {
    const raw = rawProps.industries
    industries = typeof raw === 'string' ? JSON.parse(raw) : (raw as UseCase[]) ?? []
  } catch {
    industries = []
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

        <div className="grid md:grid-cols-2 gap-8">
          {industries.map((industry, i) => (
            <div
              key={i}
              className="rounded-lg p-8 border-l-4"
              style={{ backgroundColor: cardBg, borderColor: accent }}
            >
              <div className="flex items-center gap-4 mb-4">
                {industry.icon && <span className="text-4xl">{industry.icon}</span>}
                <h3 className="text-2xl text-base-content font-bold">{industry.industry}</h3>
              </div>

              <ul className="space-y-2">
                {industry.useCases.map((useCase, ui) => (
                  <li key={ui} className="flex items-start gap-3">
                    <span style={{ color: accent }}>✓</span>
                    <span style={{ color: 'oklch(var(--bc) / 0.7)' }}>{useCase}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const IndustryUseCasesBlockDefinition: BlockDefinition = {
  type: 'IndustryUseCasesBlock',
  label: 'Industry Use Cases',
  category: 'Content',
  description: 'Show use cases by industry.',
  defaultProps: {
    heading: 'Industry Solutions',
    subtitle: 'Tailored for your business',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    industries: JSON.stringify([
      {
        industry: 'Healthcare',
        icon: '🏥',
        useCases: [
          'Patient record management',
          'Appointment scheduling',
          'Telemedicine integration',
        ],
      },
      {
        industry: 'Finance',
        icon: '💰',
        useCases: ['Risk analysis', 'Portfolio management', 'Compliance reporting'],
      },
      {
        industry: 'Retail',
        icon: '🛍️',
        useCases: ['Inventory tracking', 'POS systems', 'Customer analytics'],
      },
      {
        industry: 'Technology',
        icon: '💻',
        useCases: ['DevOps automation', 'Code deployment', 'Performance monitoring'],
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    industries: { label: 'Industries (JSON)', type: 'json' },
  },
  Component: IndustryUseCasesBlock,
}

export default IndustryUseCasesBlock
