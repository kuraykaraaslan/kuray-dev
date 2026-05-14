'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface PlanComparison {
  label: string
  starter: string
  pro: string
  enterprise: string
}

function PricingComparisonBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let rows: PlanComparison[] = []
  try {
    const raw = rawProps.rows
    rows = typeof raw === 'string' ? JSON.parse(raw) : (raw as PlanComparison[]) ?? []
  } catch {
    rows = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="bg-base-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 gap-0 border-b border-primary">
            <div className="p-4 text-base-content font-bold">Feature</div>
            <div className="p-4 text-center text-primary">Starter</div>
            <div className="p-4 text-center text-primary">Pro</div>
            <div className="p-4 text-center text-primary">Enterprise</div>
          </div>
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-0 border-b border-base-content/10 last:border-b-0"
            >
              <div className="p-4 text-base-content">{row.label}</div>
              <div className="p-4 text-center text-base-content/70">{row.starter}</div>
              <div className="p-4 text-center text-base-content/70">{row.pro}</div>
              <div className="p-4 text-center text-base-content/70">{row.enterprise}</div>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const PricingComparisonBlockDefinition: BlockDefinition = {
  type: 'PricingComparisonBlock',
  label: 'Pricing Comparison',
  category: 'Pricing',
  description: 'Compare pricing tiers in a table.',
  defaultProps: {
    heading: 'Plan Comparison',
    subtitle: 'See what each plan includes',
    rows: [
      { label: 'Users', starter: '5', pro: '25', enterprise: 'Unlimited' },
      { label: 'Support', starter: 'Email', pro: 'Priority', enterprise: 'Dedicated CSM' },
      { label: 'SSO', starter: 'No', pro: 'Yes', enterprise: 'Yes' },
      { label: 'Custom Integrations', starter: 'No', pro: 'Limited', enterprise: 'Yes' },
    ],
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'pricing-comparison',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    rows: {
      label: 'Rows',
      type: 'repeater',
      fields: {
        label:      { label: 'Feature Label', type: 'text', value: '' },
        starter:    { label: 'Starter',       type: 'text', value: '' },
        pro:        { label: 'Pro',            type: 'text', value: '' },
        enterprise: { label: 'Enterprise',    type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: PricingComparisonBlock as unknown as BlockDefinition['Component'],
}

export default PricingComparisonBlock
