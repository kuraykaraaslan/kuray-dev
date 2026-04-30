'use client'

import type { BlockDefinition } from '../types'

interface PlanComparison {
  label: string
  starter: string
  pro: string
  enterprise: string
}

function PricingComparisonBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let rows: PlanComparison[] = []
  try {
    const raw = rawProps.rows
    rows = typeof raw === 'string' ? JSON.parse(raw) : (raw as PlanComparison[]) ?? []
  } catch {
    rows = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: cardBg }}>
          <div className="grid grid-cols-4 gap-0 border-b" style={{ borderColor: accent }}>
            <div className="p-4 text-base-content font-bold">Feature</div>
            <div className="p-4 text-center" style={{ color: accent }}>Starter</div>
            <div className="p-4 text-center" style={{ color: accent }}>Pro</div>
            <div className="p-4 text-center" style={{ color: accent }}>Enterprise</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-0 border-b border-white/10 last:border-b-0">
              <div className="p-4 text-base-content">{row.label}</div>
              <div className="p-4 text-center text-base-content/70">{row.starter}</div>
              <div className="p-4 text-center text-base-content/70">{row.pro}</div>
              <div className="p-4 text-center text-base-content/70">{row.enterprise}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const PricingComparisonBlockDefinition: BlockDefinition = {
  type: 'PricingComparisonBlock',
  label: 'Pricing Comparison',
  category: 'Pricing',
  description: 'Compare pricing tiers in a table.',
  defaultProps: {
    heading: 'Plan Comparison',
    subtitle: 'See what each plan includes',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    rows: JSON.stringify([
      { label: 'Users', starter: '5', pro: '25', enterprise: 'Unlimited' },
      { label: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated CSM' },
      { label: 'SSO', starter: 'No', pro: 'Yes', enterprise: 'Yes' },
      { label: 'Custom Integrations', starter: 'No', pro: 'Limited', enterprise: 'Yes' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    rows: { label: 'Rows (JSON)', type: 'json' },
  },
  Component: PricingComparisonBlock,
}

export default PricingComparisonBlock