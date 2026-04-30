'use client'

import type { BlockDefinition } from '../types'

interface ValueItem {
  title: string
  description: string
}

function ValuesGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'

  let values: ValueItem[] = []
  try {
    const raw = rawProps.values
    values = typeof raw === 'string' ? JSON.parse(raw) : (raw as ValueItem[]) ?? []
  } catch {
    values = []
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
          {values.map((value, i) => (
            <div key={i} className="rounded-lg p-6" style={{ backgroundColor: cardBg }}>
              <h3 className="text-2xl text-white font-bold mb-3">{value.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.7)' }}>{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const ValuesGridBlockDefinition: BlockDefinition = {
  type: 'ValuesGridBlock',
  label: 'Values Grid',
  category: 'Company',
  description: 'Communicate company values or principles.',
  defaultProps: {
    heading: 'What We Stand For',
    subtitle: 'Principles that guide how we build and support products',
    bgColor: '#282626',
    cardBgColor: '#323030',
    values: JSON.stringify([
      { title: 'Clarity', description: 'Clear interfaces, clear processes, clear outcomes.' },
      { title: 'Reliability', description: 'Systems that are dependable under real enterprise load.' },
      { title: 'Partnership', description: 'We work with customers like an extension of their team.' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    values: { label: 'Values (JSON)', type: 'json' },
  },
  Component: ValuesGridBlock,
}

export default ValuesGridBlock