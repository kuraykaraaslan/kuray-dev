'use client'

import Link from 'next/link'
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
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let plans: PricingPlan[] = []
  try {
    const raw = rawProps.plans
    plans = typeof raw === 'string' ? JSON.parse(raw) : (raw as PricingPlan[]) ?? []
  } catch {
    plans = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 items-end">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`rounded-lg p-8 transition-transform hover:scale-105 ${
                plan.highlighted ? 'ring-2 scale-105' : ''
              }`}
              style={{
                backgroundColor: cardBg,
                borderColor: plan.highlighted ? accent : 'transparent',
              }}
            >
              <h3 className="text-2xl text-white font-bold mb-2">{plan.name}</h3>
              {plan.description && (
                <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {plan.description}
                </p>
              )}

              <div className="mb-6">
                <span className="text-4xl text-white font-bold">${plan.price}</span>
                {plan.period && (
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    /{plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fi) => (
                  <li key={fi} className="flex items-start gap-3">
                    <span style={{ color: accent }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.8)' }}>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.cta && plan.ctaHref && (
                <Link
                  href={plan.ctaHref}
                  className="block text-center py-3 rounded-md font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: accent, color: bg }}
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
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
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    plans: JSON.stringify([
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
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    plans: { label: 'Plans (JSON)', type: 'json' },
  },
  Component: PricingTableBlock,
}

export default PricingTableBlock
