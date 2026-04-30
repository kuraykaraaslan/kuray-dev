'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

// Matches WhatWeDo: grid of linked cards with icon, title, description

interface Card {
  icon: string
  title: string
  description: string
  href?: string
}

function CardGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '2'
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let cards: Card[] = []
  try {
    const raw = rawProps.cards
    cards = typeof raw === 'string' ? JSON.parse(raw) : (raw as Card[]) ?? []
  } catch {
    cards = []
  }

  const gridCols =
    columns === '3'
      ? 'md:grid-cols-3'
      : columns === '4'
        ? 'md:grid-cols-2 lg:grid-cols-4'
        : 'md:grid-cols-2'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-white mb-4">
                {heading}
                {headingAccent && (
                  <> <span style={{ color: accent }}>{headingAccent}</span></>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-lg max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
                <h3 className="text-2xl text-white mb-3">{card.title}</h3>
                <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {card.description}
                </p>
              </>
            )

            const sharedClass =
              'p-8 rounded-lg border-t-2 transition-all block hover:-translate-y-1'
            const sharedStyle = { backgroundColor: cardBg, borderTopColor: accent }

            return card.href ? (
              <Link key={i} href={card.href} className={sharedClass} style={sharedStyle}>
                {inner}
              </Link>
            ) : (
              <div key={i} className={sharedClass} style={sharedStyle}>
                {inner}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const defaultCards: Card[] = [
  {
    icon: '🤖',
    title: 'AI-Enabled Project Delivery',
    description:
      'Use AI to reduce friction, automate intelligence, and support faster, better decisions — without disrupting your teams.',
    href: '/products/ai-tools',
  },
  {
    icon: '🏗️',
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
    icon: '🔗',
    title: 'Complex Workflow Alignment',
    description:
      'Unify architecture, engineering, construction, and operations under a shared data and execution framework.',
    href: '/solutions/digital-solutions',
  },
]

export const CardGridBlockDefinition: BlockDefinition = {
  type: 'CardGridBlock',
  label: 'Card Grid',
  category: 'Content',
  description: 'Grid of cards with icon, title, description and optional link — used in "What We Do"',
  defaultProps: {
    heading: 'Solutions That',
    headingAccent: 'Simplify',
    subtitle:
      'From design to operations, we provide the tools and expertise you need to achieve outstanding results.',
    columns: '2',
    cards: JSON.stringify(defaultCards, null, 2),
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
  },
  schema: {
    heading: { label: 'Heading (white part)', type: 'text' },
    headingAccent: { label: 'Heading Accent (yellow part)', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns', type: 'select', options: ['2', '3', '4'] },
    cards: {
      label: 'Cards (JSON array)',
      type: 'json',
      placeholder: '[{"icon":"🤖","title":"Title","description":"Desc","href":"/link"}]',
    },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: CardGridBlock,
}

export default CardGridBlock
