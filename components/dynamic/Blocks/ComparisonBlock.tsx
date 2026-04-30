'use client'

import type { BlockDefinition } from '../types'

interface Comparison {
  feature: string
  us: string
  competitor: string
}

function ComparisonBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const ourName = (rawProps.ourName as string) || 'Us'
  const competitorName = (rawProps.competitorName as string) || 'Competitors'

  let comparisons: Comparison[] = []
  try {
    const raw = rawProps.comparisons
    comparisons = typeof raw === 'string' ? JSON.parse(raw) : (raw as Comparison[]) ?? []
  } catch {
    comparisons = []
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

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="text-left py-4 px-4 font-bold"
                  style={{ backgroundColor: cardBg, color: 'rgba(255,255,255,0.7)' }}
                >
                  Features
                </th>
                <th
                  className="text-center py-4 px-4 font-bold"
                  style={{ backgroundColor: accent, color: bg }}
                >
                  {ourName}
                </th>
                <th
                  className="text-center py-4 px-4 font-bold"
                  style={{ backgroundColor: cardBg, color: 'rgba(255,255,255,0.7)' }}
                >
                  {competitorName}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comp, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${cardBg}` }}>
                  <td className="py-4 px-4" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {comp.feature}
                  </td>
                  <td
                    className="text-center py-4 px-4"
                    style={{ backgroundColor: `${accent}20`, color: accent }}
                  >
                    {comp.us === '✓' || comp.us === 'true' ? '✓' : comp.us}
                  </td>
                  <td
                    className="text-center py-4 px-4"
                    style={{ color: 'rgba(255,255,255,0.6)' }}
                  >
                    {comp.competitor === '✓' || comp.competitor === 'true' ? '✓' : comp.competitor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export const ComparisonBlockDefinition: BlockDefinition = {
  type: 'ComparisonBlock',
  label: 'Comparison Table',
  category: 'Content',
  description: 'Compare features with competitors.',
  defaultProps: {
    heading: 'How We Compare',
    subtitle: 'See why we are the best choice',
    ourName: 'Us',
    competitorName: 'Others',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    comparisons: JSON.stringify([
      { feature: 'Feature 1', us: '✓', competitor: '✗' },
      { feature: 'Feature 2', us: '✓', competitor: '✓' },
      { feature: 'Feature 3', us: '✓', competitor: '✗' },
      { feature: 'Support', us: '24/7', competitor: '9-5' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ourName: { label: 'Our Name', type: 'text' },
    competitorName: { label: 'Competitor Name', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    comparisons: { label: 'Comparisons (JSON)', type: 'json' },
  },
  Component: ComparisonBlock,
}

export default ComparisonBlock
