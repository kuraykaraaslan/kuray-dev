'use client'

import type { BlockDefinition } from '../types'

interface TimelineEvent {
  year: string
  title: string
  description: string
}

function TimelineBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let events: TimelineEvent[] = []
  try {
    const raw = rawProps.events
    events = typeof raw === 'string' ? JSON.parse(raw) : (raw as TimelineEvent[]) ?? []
  } catch {
    events = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full"
            style={{ backgroundColor: accent }}
          ></div>

          <div className="space-y-12">
            {events.map((event, i) => (
              <div key={i} className={`flex gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                {/* Left/Right content */}
                <div className="w-full md:w-1/2">
                  <div
                    className="p-8 rounded-lg md:text-right"
                    style={{ backgroundColor: cardBg }}
                  >
                    <p className="text-sm font-bold mb-2" style={{ color: accent }}>
                      {event.year}
                    </p>
                    <h3 className="text-2xl text-base-content font-bold mb-2">{event.title}</h3>
                    <p style={{ color: 'oklch(var(--bc) / 0.7)' }}>{event.description}</p>
                  </div>
                </div>

                {/* Center dot */}
                <div className="w-full md:w-0 flex justify-center md:justify-center">
                  <div
                    className="w-4 h-4 rounded-full ring-4 ring-white flex-shrink-0"
                    style={{ backgroundColor: accent }}
                  ></div>
                </div>

                {/* Spacer for right side on desktop */}
                <div className="hidden md:block w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export const TimelineBlockDefinition: BlockDefinition = {
  type: 'TimelineBlock',
  label: 'Timeline',
  category: 'Content',
  description: 'Vertical timeline showing events chronologically.',
  defaultProps: {
    heading: 'Our Journey',
    subtitle: 'Milestones and achievements along the way',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    events: JSON.stringify([
      {
        year: '2020',
        title: 'Founded',
        description: 'Started with a vision to revolutionize the industry',
      },
      {
        year: '2021',
        title: 'Series A',
        description: 'Raised $5M in Series A funding',
      },
      {
        year: '2022',
        title: 'Global Expansion',
        description: 'Expanded to 15 countries',
      },
      {
        year: '2023',
        title: '10K Users',
        description: 'Reached 10,000 happy customers',
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    events: { label: 'Timeline Events (JSON)', type: 'json' },
  },
  Component: TimelineBlock,
}

export default TimelineBlock
