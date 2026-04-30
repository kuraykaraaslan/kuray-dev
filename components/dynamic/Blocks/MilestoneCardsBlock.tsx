'use client'

import type { BlockDefinition } from '../types'

interface MilestoneCard {
  title: string
  description: string
  date?: string
}

function MilestoneCardsBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let milestones: MilestoneCard[] = []
  try {
    const raw = rawProps.milestones
    milestones = typeof raw === 'string' ? JSON.parse(raw) : (raw as MilestoneCard[]) ?? []
  } catch {
    milestones = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {milestones.map((milestone, i) => (
            <div key={i} className="rounded-lg p-6" style={{ backgroundColor: cardBg }}>
              {milestone.date && <div className="text-sm font-semibold mb-3" style={{ color: accent }}>{milestone.date}</div>}
              <h3 className="text-2xl text-white font-bold mb-3">{milestone.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const MilestoneCardsBlockDefinition: BlockDefinition = {
  type: 'MilestoneCardsBlock',
  label: 'Milestone Cards',
  category: 'Company',
  description: 'Display key company milestones as cards.',
  defaultProps: {
    heading: 'Key Milestones',
    subtitle: 'Selected moments from our journey',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    milestones: JSON.stringify([
      { title: 'First Product Launch', description: 'Released our first enterprise platform version.', date: '2022' },
      { title: 'Global Customers', description: 'Expanded across multiple continents and time zones.', date: '2023' },
      { title: 'Security Certification', description: 'Established stronger security and compliance controls.', date: '2024' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    milestones: { label: 'Milestones (JSON)', type: 'json' },
  },
  Component: MilestoneCardsBlock,
}

export default MilestoneCardsBlock