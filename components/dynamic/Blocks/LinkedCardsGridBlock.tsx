'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface LinkedCard {
  icon: string
  title: string
  description: string
  href: string
}

function parseCards(raw: unknown): LinkedCard[] {
  if (Array.isArray(raw)) return raw as LinkedCard[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function LinkedCardsGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  const cards = parseCards(rawProps.cards)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-16">
              {heading && (
                <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                  {heading}{' '}
                  {headingAccent && (
                    <span className="text-primary">{headingAccent}</span>
                  )}
                </h2>
              )}
              {subtitle && (
                <p className="text-lg max-w-3xl mx-auto text-base-content/70">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {cards.map((card, i) => (
              <Link
                key={i}
                href={card.href || '#'}
                className="bg-base-200 rounded-lg p-8 border-t-2 border-t-primary hover:-translate-y-1 transition-all block"
              >
                <div className="text-3xl mb-4">{card.icon}</div>
                <h3 className="text-2xl text-base-content mb-3">{card.title}</h3>
                <p className="leading-relaxed text-base-content/70">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const LinkedCardsGridBlockDefinition: BlockDefinition = {
  type: 'LinkedCardsGridBlock',
  label: 'Linked Cards Grid',
  category: 'Features & Services',
  description: '2-column grid of clickable cards with top accent border — icon, title, description, href per card.',
  defaultProps: {
    heading: 'Solutions That',
    headingAccent: 'Simplify',
    subtitle:
      'From design to operations, we provide the tools and expertise you need to achieve outstanding results.',
    cards: [
      {
        icon: '🤖',
        title: 'AI-Enabled Project Delivery',
        description:
          'Use AI to reduce friction, automate intelligence, and support faster, better decisions — without disrupting your teams.',
        href: '/products/ai-tools',
      },
      {
        icon: '🧊',
        title: 'Digital Twins for Large-Scale Assets',
        description:
          'Move beyond static models. Create living, operational intelligence for infrastructure and complex developments.',
        href: '/solutions/smart-twins',
      },
      {
        icon: '👔',
        title: 'Enterprise AECO Advisory',
        description:
          'Strategic guidance for leadership teams navigating BIM, AI adoption, digital transformation, and delivery excellence.',
        href: '/solutions/digital-practice',
      },
      {
        icon: '🔀',
        title: 'Complex Workflow Alignment',
        description:
          'Unify architecture, engineering, construction, and operations under a shared data and execution framework.',
        href: '/solutions/digital-solutions',
      },
    ],
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'linked-cards',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    headingAccent: { label: 'Heading Accent Word', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    cards: {
      label: 'Cards',
      type: 'repeater',
      fields: {
        icon: { label: 'Icon (emoji)', type: 'text', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
        href: { label: 'Link URL', type: 'url', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: LinkedCardsGridBlock as unknown as BlockDefinition['Component'],
}

export default LinkedCardsGridBlock
