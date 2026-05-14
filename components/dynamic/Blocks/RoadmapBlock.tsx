'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface RoadmapItem {
  quarter: string
  title: string
  description: string
  status?: string
}

const DEFAULT_MILESTONES: RoadmapItem[] = [
  { quarter: 'Q2 2026', title: 'Workflow Automation', description: 'Release advanced automation and orchestration tools.', status: 'In Progress' },
  { quarter: 'Q3 2026', title: 'Enterprise Analytics', description: 'Ship dashboards, forecasting, and reporting upgrades.', status: 'Planned' },
  { quarter: 'Q4 2026', title: 'Partner Integrations', description: 'Expand integrations with key enterprise systems.', status: 'Planned' },
]

function parseMilestones(raw: unknown): RoadmapItem[] {
  if (Array.isArray(raw)) return raw as RoadmapItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_MILESTONES
}

function RoadmapBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const milestones = parseMilestones(rawProps.milestones)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="space-y-6">
          {milestones.map((milestone, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="min-w-24 px-4 py-2 rounded-full text-center font-bold text-sm flex-shrink-0 bg-primary text-primary-content">
                {milestone.quarter}
              </div>
              <div className="flex-1 rounded-lg p-6 bg-base-200">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <h3 className="text-2xl text-base-content font-bold">{milestone.title}</h3>
                  {milestone.status && (
                    <span className="text-xs font-semibold uppercase text-primary">
                      {milestone.status}
                    </span>
                  )}
                </div>
                <p className="text-base-content/70">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    milestones: DEFAULT_MILESTONES,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'roadmap',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    milestones: {
      label: 'Milestones',
      type: 'repeater',
      fields: {
        quarter: { label: 'Quarter/Date', type: 'text', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
        status: { label: 'Status', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: RoadmapBlock as unknown as BlockDefinition['Component'],
}

export default RoadmapBlock
