'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface MilestoneCard {
  title: string
  description: string
  date?: string
}

const DEFAULT_MILESTONES: MilestoneCard[] = [
  { title: 'First Product Launch', description: 'Released our first enterprise platform version.', date: '2022' },
  { title: 'Global Customers', description: 'Expanded across multiple continents and time zones.', date: '2023' },
  { title: 'Security Certification', description: 'Established stronger security and compliance controls.', date: '2024' },
]

function parseMilestones(raw: unknown): MilestoneCard[] {
  if (Array.isArray(raw)) return raw as MilestoneCard[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_MILESTONES
}

function MilestoneCardsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const milestones = parseMilestones(rawProps.milestones)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {milestones.map((milestone, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-6">
              {milestone.date && (
                <div className="text-sm font-semibold mb-3 text-primary">
                  {milestone.date}
                </div>
              )}
              <h3 className="text-2xl text-base-content font-bold mb-3">{milestone.title}</h3>
              <p className="text-base-content/70">{milestone.description}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    milestones: DEFAULT_MILESTONES,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'milestones',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    milestones: {
      label: 'Milestones',
      type: 'repeater',
      fields: {
        date:        { label: 'Date / Year',   type: 'text',     value: '' },
        title:       { label: 'Title',         type: 'text',     value: '' },
        description: { label: 'Description',   type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: MilestoneCardsBlock as unknown as BlockDefinition['Component'],
}

export default MilestoneCardsBlock
