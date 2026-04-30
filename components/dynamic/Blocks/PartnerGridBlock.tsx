'use client'

import type { BlockDefinition } from '../types'

interface PartnerItem {
  name: string
  description?: string
  icon?: string
}

function PartnerGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'

  let partners: PartnerItem[] = []
  try {
    const raw = rawProps.partners
    partners = typeof raw === 'string' ? JSON.parse(raw) : (raw as PartnerItem[]) ?? []
  } catch {
    partners = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {partners.map((partner, i) => (
            <div key={i} className="rounded-lg p-6" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center gap-4 mb-3">
                {partner.icon && <span className="text-3xl">{partner.icon}</span>}
                <h3 className="text-2xl text-base-content font-bold">{partner.name}</h3>
              </div>
              {partner.description && <p style={{ color: 'oklch(var(--bc) / 0.7)' }}>{partner.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
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
    bgColor: '',
    cardBgColor: '',
    partners: JSON.stringify([
      { name: 'Cloud Partners', icon: '☁️', description: 'Infrastructure and hosting partners' },
      { name: 'System Integrators', icon: '🔧', description: 'Implementation and services partners' },
      { name: 'Technology Alliances', icon: '🤝', description: 'Platform and product partnerships' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    partners: { label: 'Partners (JSON)', type: 'json' },
  },
  Component: PartnerGridBlock,
}

export default PartnerGridBlock