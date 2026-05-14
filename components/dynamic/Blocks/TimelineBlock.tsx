'use client'
import { useState, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faAnglesUp, faBriefcase } from '@fortawesome/free-solid-svg-icons'
import { ICON_MAP } from '../icons'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../BaseBlock'
import type { BlockDefinition } from '../types'

interface TimelineItem {
  period: string
  title: string
  company: string
  description?: string
  icon: string
  side: 'auto' | 'start' | 'end'
}

const DEFAULT_ITEMS: TimelineItem[] = [
  { period: '2023 – Present', title: 'Software Engineer',         company: 'Roltek',     description: 'Full-stack development with Next.js and Node.js.', icon: 'briefcase',      side: 'auto' },
  { period: '2022 – 2023',    title: 'Frontend Developer',        company: 'Kuray Yapı', description: 'Built responsive web applications.',               icon: 'briefcase',      side: 'auto' },
  { period: '2021 – 2022',    title: 'Junior Developer',          company: 'CADBim',     description: 'Worked on CAD/BIM integrations.',                  icon: 'briefcase',      side: 'auto' },
  { period: '2018 – 2022',    title: 'Computer Engineering B.Sc.',company: 'DEU',        description: '',                                                 icon: 'graduation-cap', side: 'auto' },
]

function parseItems(raw: unknown): TimelineItem[] {
  if (Array.isArray(raw)) return raw as TimelineItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_ITEMS
}

function resolveSide(item: TimelineItem, index: number): 'start' | 'end' {
  if (item.side === 'start') return 'start'
  if (item.side === 'end') return 'end'
  return index % 2 === 0 ? 'start' : 'end'
}

function TimelineBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const title         = (rawProps.title as string)         || 'My Journey'
  const description   = (rawProps.description as string)   || 'A timeline of my professional experience.'
  const atLabel       = (rawProps.atLabel as string)       || 'at'
  const showMoreLabel = (rawProps.showMoreLabel as string) || 'Show More'
  const showLessLabel = (rawProps.showLessLabel as string) || 'Show Less'
  const lineColor     = (rawProps.lineColor as string)     || ''

  const [expanded, setExpanded] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const items = parseItems(rawProps.items)

  const handleExpand = () => {
    const panel = container.current
    if (!panel) return
    panel.style.height = expanded ? '560px' : `${panel.scrollHeight + 80}px`
    setExpanded(!expanded)
  }

  return (
    <BaseBlock {...baseProps}>
      <div
        className="px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6 duration-1000"
        style={{ height: '560px', overflow: 'clip' }}
        ref={container}
      >
        <div className="mx-auto max-w-screen-sm text-center lg:mb-8 -mt-8 lg:mt-0">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold">{title}</h2>
          <p className="font-light sm:text-xl">{description}</p>
        </div>

        <ul className="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical pt-2">
          {items.map((item, index) => {
            const side   = resolveSide(item, index)
            const isLast = index === items.length - 1
            const icon   = ICON_MAP[item.icon] ?? faBriefcase

            return (
              <li key={index}>
                {index > 0 && <hr className="bg-primary" style={lineColor ? { backgroundColor: lineColor } : undefined} />}

                <div
                  className="timeline-middle bg-base-300 p-2 rounded-full border-2 border-primary"
                  style={lineColor ? { borderColor: lineColor } : undefined}
                >
                  <FontAwesomeIcon icon={icon} className="h-5 w-5" />
                </div>

                <div
                  className={[
                    'mb-10',
                    side === 'start'
                      ? 'timeline-start md:text-end me-3 ps-3'
                      : 'timeline-end ml-3',
                  ].join(' ')}
                >
                  <time className="font-mono italic">{item.period}</time>
                  <div className="text-lg font-black">
                    {item.title}
                    {item.company && (
                      <>
                        {' '}
                        <span className="text-sm italic font-normal">{atLabel}</span>
                        {' '}
                        {item.company}
                      </>
                    )}
                  </div>
                  {item.description && (
                    <span className="text-sm max-w-2xl whitespace-pre-line">{item.description}</span>
                  )}
                </div>

                {!isLast && <hr className="bg-primary" style={lineColor ? { backgroundColor: lineColor } : undefined} />}
              </li>
            )
          })}
        </ul>
      </div>

      {/* Expand / collapse */}
      <div style={{ zIndex: 8, position: 'relative', height: 0, display: 'flex', justifyContent: 'center' }}>
        <div
          className="bg-gradient-to-b from-base-200/20 to-base-300"
          style={{ height: '80px', width: '100%', display: 'flex', justifyContent: 'center', transform: 'translateY(-80px)' }}
        >
          <button
            className={`flex flex-col items-center gap-2 ${!expanded ? 'animate-bounce' : ''}`}
            style={{ height: '80px', width: '130px' }}
            onClick={handleExpand}
          >
            <FontAwesomeIcon icon={expanded ? faAnglesUp : faAnglesDown} style={{ width: '2rem', height: '2rem' }} />
            <span>{expanded ? showLessLabel : showMoreLabel}</span>
          </button>
        </div>
      </div>
    </BaseBlock>
  )
}

export const TimelineBlockDefinition: BlockDefinition = {
  type: 'TimelineBlock',
  label: 'Timeline',
  description: 'Collapsible vertical timeline — add, remove, and reorder items freely with icon picker.',
  category: 'Hero',
  defaultProps: {
    title: 'My Journey',
    description: 'A timeline of my professional experience and milestones.',
    atLabel: 'at',
    showMoreLabel: 'Show More',
    showLessLabel: 'Show Less',
    items: DEFAULT_ITEMS,
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'timeline',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title:         { label: 'Section Title',       type: 'text' },
    description:   { label: 'Section Description', type: 'textarea' },
    atLabel:       { label: '"at" Label',          type: 'text', placeholder: 'at' },
    showMoreLabel: { label: '"Show More" Label',   type: 'text' },
    showLessLabel: { label: '"Show Less" Label',   type: 'text' },
    lineColor:     { label: 'Line Color',          type: 'color', placeholder: '#6b7280' },
    items: {
      label: 'Timeline Items',
      type: 'repeater',
      fields: {
        icon:        { label: 'Icon',                         type: 'icon' },
        period:      { label: 'Period',                       type: 'text', placeholder: '2022 – 2024' },
        title:       { label: 'Title / Role',                 type: 'text', placeholder: 'Software Engineer' },
        company:     { label: 'Company / Institution',        type: 'text', placeholder: 'ACME Corp' },
        description: { label: 'Description (optional)',       type: 'textarea' },
        side:        { label: 'Side',                         type: 'select', options: ['auto', 'start', 'end'], value: 'auto' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TimelineBlock as unknown as BlockDefinition['Component'],
}

export default TimelineBlock
