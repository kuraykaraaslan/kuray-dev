'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Comparison {
  feature: string
  us: string
  competitor: string
}

function ComparisonBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
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
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:px-12 lg:px-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-4 font-bold bg-base-300 text-base-content/70">
                  Features
                </th>
                <th className="text-center py-4 px-4 font-bold bg-primary text-primary-content">
                  {ourName}
                </th>
                <th className="text-center py-4 px-4 font-bold bg-base-300 text-base-content/70">
                  {competitorName}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((comp, i) => (
                <tr key={i} className="border-b border-base-300">
                  <td className="py-4 px-4 text-base-content">
                    {comp.feature}
                  </td>
                  <td className="text-center py-4 px-4 bg-primary/10 text-primary">
                    {comp.us === '✓' || comp.us === 'true' ? '✓' : comp.us}
                  </td>
                  <td className="text-center py-4 px-4 text-base-content/60">
                    {comp.competitor === '✓' || comp.competitor === 'true' ? '✓' : comp.competitor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BaseBlock>
  )
}

export const ComparisonBlockDefinition: BlockDefinition = {
  type: 'ComparisonBlock',
  label: 'Comparison Table',
  category: 'Content',
  description: 'Compare features side-by-side with a competitor column.',
  defaultProps: {
    heading: 'How We Compare',
    subtitle: 'See why we are the best choice',
    ourName: 'Us',
    competitorName: 'Others',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    comparisons: JSON.stringify([
      { feature: 'Feature 1', us: '✓', competitor: '✗' },
      { feature: 'Feature 2', us: '✓', competitor: '✓' },
      { feature: 'Feature 3', us: '✓', competitor: '✗' },
      { feature: 'Support', us: '24/7', competitor: '9-5' },
    ]),
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ourName: { label: 'Our Name', type: 'text' },
    competitorName: { label: 'Competitor Name', type: 'text' },
    comparisons: {
      label: 'Comparisons',
      type: 'repeater',
      fields: {
        feature: { label: 'Feature', type: 'text', value: '' },
        us: { label: 'Our Value', type: 'text', value: '✓' },
        competitor: { label: 'Competitor Value', type: 'text', value: '✗' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ComparisonBlock as unknown as BlockDefinition['Component'],
}

export default ComparisonBlock
