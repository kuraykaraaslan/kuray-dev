'use client'

import type { BlockDefinition } from '../types'

interface RoadmapItem {
  quarter: string
  title: string
  description: string
  status?: string
}

function RoadmapBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let milestones: RoadmapItem[] = []
  try {
    const raw = rawProps.milestones
    milestones = typeof raw === 'string' ? JSON.parse(raw) : (raw as RoadmapItem[]) ?? []
  } catch {
    milestones = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {milestones.map((milestone, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div
                className="min-w-24 px-4 py-2 rounded-full text-center font-bold"
                style={{ backgroundColor: accent, color: bg }}
              >
                {milestone.quarter}
              </div>
              <div className="flex-1 rounded-lg p-6" style={{ backgroundColor: cardBg }}>
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-2xl text-white font-bold">{milestone.title}</h3>
                  {milestone.status && (
                    <span className="text-xs font-semibold uppercase" style={{ color: accent }}>
                      {milestone.status}
                    </span>
                  )}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const RoadmapBlockDefinition: BlockDefinition = {
  type: 'RoadmapBlock',
  label: 'Roadmap',
  category: 'Content',
  description: 'Show planned milestones and product roadmap items.',
  defaultProps: {
    heading: 'Product Roadmap',
    subtitle: 'What we are building next',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    milestones: JSON.stringify([
      {
        quarter: 'Q2 2026',
        title: 'Workflow Automation',
        description: 'Release advanced automation and orchestration tools.',
        status: 'In Progress',
      },
      {
        quarter: 'Q3 2026',
        title: 'Enterprise Analytics',
        description: 'Ship dashboards, forecasting, and reporting upgrades.',
        status: 'Planned',
      },
      {
        quarter: 'Q4 2026',
        title: 'Partner Integrations',
        description: 'Expand integrations with key enterprise systems.',
        status: 'Planned',
      },
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
  Component: RoadmapBlock,
}

export default RoadmapBlock