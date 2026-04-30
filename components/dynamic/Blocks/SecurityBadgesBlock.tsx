'use client'

import type { BlockDefinition } from '../types'

interface BadgeItem {
  label: string
  description?: string
}

function SecurityBadgesBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let badges: BadgeItem[] = []
  try {
    const raw = rawProps.badges
    badges = typeof raw === 'string' ? JSON.parse(raw) : (raw as BadgeItem[]) ?? []
  } catch {
    badges = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <div key={i} className="rounded-lg p-6 text-center" style={{ backgroundColor: cardBg }}>
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ backgroundColor: accent, color: bg }}>
                ✓
              </div>
              <h3 className="text-xl text-white font-bold mb-2">{badge.label}</h3>
              {badge.description && <p style={{ color: 'rgba(255,255,255,0.7)' }}>{badge.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const SecurityBadgesBlockDefinition: BlockDefinition = {
  type: 'SecurityBadgesBlock',
  label: 'Security Badges',
  category: 'Trust',
  description: 'Display certifications, compliance, and security assurances.',
  defaultProps: {
    heading: 'Security & Compliance',
    subtitle: 'Enterprise-grade safeguards you can trust',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    badges: JSON.stringify([
      { label: 'SOC 2 Ready', description: 'Processes designed with auditability in mind' },
      { label: 'SSO / SAML', description: 'Single sign-on support for identity teams' },
      { label: 'Role-Based Access', description: 'Fine-grained permissions and controls' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    badges: { label: 'Badges (JSON)', type: 'json' },
  },
  Component: SecurityBadgesBlock,
}

export default SecurityBadgesBlock