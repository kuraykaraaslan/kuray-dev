'use client'

import type { BlockDefinition } from '../types'

interface TimelineEvent {
  period: string
  title: string
  company: string
  description?: string
  type: 'work' | 'education'
}

const DEFAULT_ITEMS: TimelineEvent[] = [
  { period: '2023 – Present', title: 'Full-Stack Developer', company: 'Freelance', description: 'Building web and mobile applications for clients worldwide.', type: 'work' },
  { period: '2021 – 2023', title: 'Junior Developer', company: 'Tech Company', description: 'Developed internal tools and customer-facing products.', type: 'work' },
  { period: '2017 – 2022', title: 'B.Sc. Computer Engineering', company: 'University', description: 'Graduated with honors.', type: 'education' },
]

function FrontendCareerTimelineBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Career Timeline'
  const description = (rawProps.description as string) || 'My professional journey so far.'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b1))'

  let items: TimelineEvent[] = DEFAULT_ITEMS
  if (typeof rawProps.items === 'string') {
    try { items = JSON.parse(rawProps.items) } catch { /* keep default */ }
  } else if (Array.isArray(rawProps.items)) {
    items = rawProps.items as TimelineEvent[]
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-base-content mb-3">{heading}</h2>
          <p className="text-base-content/60 text-lg">{description}</p>
        </div>
        <ul className="timeline timeline-snap-icon timeline-vertical">
          {items.map((item, i) => {
            const isLeft = i % 2 === 0
            const icon = item.type === 'education' ? '🎓' : '💼'
            return (
              <li key={i}>
                {i > 0 && <hr className="bg-base-content/20" />}
                <div className="timeline-middle bg-base-300 p-2 rounded-full text-sm w-9 h-9 flex items-center justify-center">
                  {icon}
                </div>
                <div className={`mb-10 ${isLeft ? 'timeline-start md:text-end me-4' : 'timeline-end ml-4'}`}>
                  <time className="font-mono text-sm text-primary">{item.period}</time>
                  <div className="text-lg font-bold text-base-content mt-0.5">
                    {item.title}
                    <span className="text-sm font-normal text-base-content/50 ml-2">@ {item.company}</span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-base-content/60 mt-1 max-w-sm">{item.description}</p>
                  )}
                </div>
                {i < items.length - 1 && <hr className="bg-base-content/20" />}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export const FrontendCareerTimelineBlockDefinition: BlockDefinition = {
  type: 'FrontendCareerTimelineBlock',
  label: 'Career Timeline',
  description: 'Portfolio career and education timeline with configurable items.',
  category: 'Frontend',
  defaultProps: {
    heading: 'Career Timeline',
    description: 'My professional journey so far.',
    bgColor: '',
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    bgColor: { label: 'Background Color', type: 'color' },
    items: {
      label: 'Timeline Items (JSON)',
      type: 'json',
      placeholder: '[{"period":"2023 – Present","title":"Developer","company":"Company","description":"...","type":"work"}]',
    },
  },
  Component: FrontendCareerTimelineBlock,
}

export default FrontendCareerTimelineBlock
