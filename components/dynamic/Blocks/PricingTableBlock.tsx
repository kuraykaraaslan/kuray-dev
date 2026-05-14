'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface PricingPlan {
  name: string
  price: string
  period?: string
  description?: string
  features: string[]
  cta?: string
  ctaHref?: string
  highlighted?: boolean
}

function PricingTableBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let plans: PricingPlan[] = []
  try {
    const raw = rawProps.plans
    plans = typeof raw === 'string' ? JSON.parse(raw) : (raw as PricingPlan[]) ?? []
  } catch {
    plans = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-end">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-base-200 rounded-lg p-8 transition-transform hover:scale-105${plan.highlighted ? ' ring-2 ring-primary scale-105' : ''}`}
            >
              <h3 className="text-2xl text-base-content font-bold mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm mb-6 text-base-content/60">
                  {plan.description}
                </p>
              )}

              <div className="mb-6">
                <span className="text-4xl text-base-content font-bold">${plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-base-content/60">
                    /{plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {(plan.features ?? []).map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <span className="text-primary">✓</span>
                    <span className="text-base-content/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.cta && plan.ctaHref && (
                <Link
                  href={plan.ctaHref}
                  className={`btn w-full${plan.highlighted ? ' btn-primary' : ' btn-outline'}`}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const PricingTableBlockDefinition: BlockDefinition = {
  type: 'PricingTableBlock',
  label: 'Pricing Table',
  category: 'Pricing',
  description: 'Display pricing plans in a comparison table.',
  defaultProps: {
    heading: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that works for you',
    plans: [
      {
        name: 'Starter',
        price: '29',
        period: 'month',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
        cta: 'Get Started',
        ctaHref: '/signup',
      },
      {
        name: 'Pro',
        price: '79',
        period: 'month',
        features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
        cta: 'Get Started',
        ctaHref: '/signup',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        features: ['All Pro features', 'Dedicated support', 'Custom integrations'],
        cta: 'Contact Sales',
        ctaHref: '/contact',
      },
    ],
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'pricing',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    plans: {
      label: 'Plans',
      type: 'repeater',
      fields: {
        name:        { label: 'Plan Name',    type: 'text',     value: '' },
        price:       { label: 'Price',        type: 'text',     value: '' },
        period:      { label: 'Period',       type: 'text',     value: 'month' },
        description: { label: 'Description', type: 'textarea', value: '' },
        features:    { label: 'Features (one per line)', type: 'textarea', value: '' },
        cta:         { label: 'Button Label', type: 'text',     value: '' },
        ctaHref:     { label: 'Button URL',   type: 'url',      value: '' },
        highlighted: { label: 'Highlighted',  type: 'text',     value: 'false' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: PricingTableBlock as unknown as BlockDefinition['Component'],
}

export default PricingTableBlock
