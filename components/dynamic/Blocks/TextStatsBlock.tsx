'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface StatItem {
  value: string
  label: string
}

const DEFAULT_PARAGRAPHS = [
  "We don't operate as outsiders. We operate as partners who understand local context, regulatory environments, and delivery realities.",
  'No experiments. No abstractions. Only execution.',
  "Our values drive everything we do. We believe in delivering solutions that don't just solve problems — they transform how you work.",
]

const DEFAULT_STATS: StatItem[] = [
  { value: '+130', label: 'Completed Projects' },
  { value: '+30', label: 'Languages Spoken' },
  { value: '7', label: 'Global Offices' },
  { value: '2019', label: 'Founded' },
]

function parseParagraphs(raw: unknown): string[] {
  let arr: unknown[] = []
  if (Array.isArray(raw)) arr = raw
  else if (typeof raw === 'string') {
    try { arr = JSON.parse(raw) } catch { return DEFAULT_PARAGRAPHS }
  } else {
    return DEFAULT_PARAGRAPHS
  }
  return arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
}

function parseStats(raw: unknown): StatItem[] {
  if (Array.isArray(raw)) return raw as StatItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_STATS
}

function TextStatsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const accentHeading = (rawProps.accentHeading as string) || ''
  const paragraphList = parseParagraphs(rawProps.paragraphs)
  const stats = parseStats(rawProps.stats)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid gap-12 items-center grid-cols-1 md:grid-cols-2">
          <div>
            {(heading || accentHeading) && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-6">
                {heading && <>{heading}<br /></>}
                {accentHeading && <span className="text-primary">{accentHeading}</span>}
              </h2>
            )}
            {paragraphList.map((p, i) => (
              <p key={i} className="leading-relaxed mb-4 text-base-content/80">{p}</p>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="bg-base-200 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold mb-2 text-primary">{stat.value}</div>
                <p className="text-sm text-base-content/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const TextStatsBlockDefinition: BlockDefinition = {
  type: 'TextStatsBlock',
  label: 'Text + Stats Grid',
  category: 'Company',
  description: 'Text (heading + paragraphs) on left, 2×2 stat cards on right.',
  defaultProps: {
    heading: 'Global Expertise,',
    accentHeading: 'Local Presence',
    paragraphs: DEFAULT_PARAGRAPHS.map(text => ({ text })),
    stats: DEFAULT_STATS,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'text-stats',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading (first line)', type: 'text' },
    accentHeading: { label: 'Heading (accented second line)', type: 'text' },
    paragraphs: {
      label: 'Paragraphs',
      type: 'repeater',
      fields: { text: { label: 'Paragraph', type: 'textarea', value: '' } },
    },
    stats: {
      label: 'Stats',
      type: 'repeater',
      fields: {
        value: { label: 'Value', type: 'text', value: '' },
        label: { label: 'Label', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TextStatsBlock as unknown as BlockDefinition['Component'],
}

export default TextStatsBlock
