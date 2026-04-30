'use client'

import type { BlockDefinition } from '../types'

interface StatItem {
  label: string
  value: string
  note?: string
}

function StatsDashboardBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let stats: StatItem[] = []
  try {
    const raw = rawProps.stats
    stats = typeof raw === 'string' ? JSON.parse(raw) : (raw as StatItem[]) ?? []
  } catch {
    stats = []
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

        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="rounded-lg p-6 text-center" style={{ backgroundColor: cardBg }}>
              <div className="text-4xl font-bold mb-2" style={{ color: accent }}>{stat.value}</div>
              <div className="text-white font-semibold mb-1">{stat.label}</div>
              {stat.note && <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{stat.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const StatsDashboardBlockDefinition: BlockDefinition = {
  type: 'StatsDashboardBlock',
  label: 'Stats Dashboard',
  category: 'Social Proof',
  description: 'Show metrics and KPIs in dashboard cards.',
  defaultProps: {
    heading: 'Operational Metrics',
    subtitle: 'Key numbers your leadership team cares about',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    stats: JSON.stringify([
      { label: 'Uptime', value: '99.99%', note: 'Last 12 months' },
      { label: 'Response Time', value: '<200ms', note: 'Global average' },
      { label: 'Automation Rate', value: '78%', note: 'Processes automated' },
      { label: 'CSAT', value: '4.9/5', note: 'Customer satisfaction' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    stats: { label: 'Stats (JSON)', type: 'json' },
  },
  Component: StatsDashboardBlock,
}

export default StatsDashboardBlock