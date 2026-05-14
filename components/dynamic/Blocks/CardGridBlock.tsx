'use client'

import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Literal column map — dynamic Tailwind class generation is forbidden
const COLS: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

interface Card {
  icon: string
  title: string
  description: string
  href?: string
}

function CardGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '2'

  let cards: Card[] = []
  try {
    const raw = rawProps.cards
    cards = typeof raw === 'string' ? JSON.parse(raw) : (raw as Card[]) ?? []
  } catch {
    cards = []
  }

  const gridCols = COLS[columns] ?? COLS['2']

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                {heading}
                {headingAccent && (
                  <> <span className="text-primary">{headingAccent}</span></>
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

        <div className={`grid ${gridCols} gap-8`}>
          {cards.map((card, i) => {
            const inner = (
              <>
                {card.icon && <div className="text-3xl mb-4">{card.icon}</div>}
                <h3 className="text-2xl text-base-content mb-3">{card.title}</h3>
                <p className="leading-relaxed text-base-content/70">
                  {card.description}
                </p>
              </>
            )

            const sharedClass =
              'p-8 rounded-lg border-t-2 border-primary bg-base-200 transition-all block hover:-translate-y-1'

            return card.href ? (
              <Link key={i} href={card.href} className={sharedClass}>
                {inner}
              </Link>
            ) : (
              <div key={i} className={sharedClass}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

const defaultCards: Card[] = [
  {
    icon: '🤖',
    title: 'AI-Enabled Project Delivery',
    description:
      'Use AI to reduce friction, automate intelligence, and support faster, better decisions — without disrupting your teams.',
    href: '/projects',
  },
  {
    icon: '🏗️',
    title: 'Digital Twins for Large-Scale Assets',
    description:
      'Move beyond static models. Create living, operational intelligence for infrastructure and complex developments.',
    href: '/projects',
  },
  {
    icon: '👔',
    title: 'Enterprise Advisory',
    description:
      'Strategic guidance for leadership teams navigating digital transformation and delivery excellence.',
    href: '/contact',
  },
  {
    icon: '🔗',
    title: 'Complex Workflow Alignment',
    description:
      'Unify architecture, engineering, and operations under a shared data and execution framework.',
    href: '/contact',
  },
]

export const CardGridBlockDefinition: BlockDefinition = {
  type: 'CardGridBlock',
  label: 'Card Grid',
  category: 'Content',
  description: 'Grid of cards with icon, title, description and optional link.',
  defaultProps: {
    heading: 'Solutions That',
    headingAccent: 'Simplify',
    subtitle:
      'From design to operations, we provide the tools and expertise you need to achieve outstanding results.',
    columns: '2',
    cards: defaultCards,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'card-grid',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading (main part)', type: 'text' },
    headingAccent: { label: 'Heading Accent (primary-colored part)', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    cards: {
      label: 'Cards',
      type: 'repeater',
      fields: {
        icon:        { label: 'Icon (emoji)', type: 'text',     value: '⭐' },
        title:       { label: 'Title',        type: 'text',     value: '' },
        description: { label: 'Description',  type: 'textarea', value: '' },
        href:        { label: 'Link URL',      type: 'url',      value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: CardGridBlock as unknown as BlockDefinition['Component'],
}

export default CardGridBlock
