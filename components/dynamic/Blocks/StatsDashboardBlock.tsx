'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface StatItem {
  label: string
  value: string
  note?: string
}

const DEFAULT_STATS: StatItem[] = [
  { label: 'Uptime', value: '99.99%', note: 'Last 12 months' },
  { label: 'Response Time', value: '<200ms', note: 'Global average' },
  { label: 'Automation Rate', value: '78%', note: 'Processes automated' },
  { label: 'CSAT', value: '4.9/5', note: 'Customer satisfaction' },
]

function parseStats(raw: unknown): StatItem[] {
  if (Array.isArray(raw)) return raw as StatItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_STATS
}

function StatsDashboardBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const stats = parseStats(rawProps.stats)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
          {stats.map((stat, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2 text-primary">{stat.value}</div>
              <div className="text-base-content font-semibold mb-1">{stat.label}</div>
              {stat.note && <div className="text-sm text-base-content/60">{stat.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    stats: DEFAULT_STATS,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'stats',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    stats: {
      label: 'Stats',
      type: 'repeater',
      fields: {
        value: { label: 'Value', type: 'text', value: '' },
        label: { label: 'Label', type: 'text', value: '' },
        note:  { label: 'Note',  type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: StatsDashboardBlock as unknown as BlockDefinition['Component'],
}

export default StatsDashboardBlock
