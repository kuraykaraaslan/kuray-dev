'use client'

import type { BlockDefinition } from '../types'

interface ChecklistItem {
  text: string
  done?: boolean
}

function ChecklistBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let items: ChecklistItem[] = []
  try {
    const raw = rawProps.items
    items = typeof raw === 'string' ? JSON.parse(raw) : (raw as ChecklistItem[]) ?? []
  } catch {
    items = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="rounded-lg p-8" style={{ backgroundColor: cardBg }}>
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span style={{ color: item.done === false ? 'oklch(var(--bc) / 0.4)' : accent }}>
                  {item.done === false ? '◌' : '✓'}
                </span>
                <span style={{ color: item.done === false ? 'oklch(var(--bc) / 0.5)' : 'oklch(var(--bc) / 0.85)' }}>
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export const ChecklistBlockDefinition: BlockDefinition = {
  type: 'ChecklistBlock',
  label: 'Checklist',
  category: 'Content',
  description: 'Render a checklist for onboarding, security, or launch readiness.',
  defaultProps: {
    heading: 'Launch Checklist',
    subtitle: 'Everything covered before go-live',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    items: JSON.stringify([
      { text: 'Security review completed', done: true },
      { text: 'Analytics events configured', done: true },
      { text: 'SSO enabled', done: true },
      { text: 'Backup and rollback plan documented', done: false },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    items: { label: 'Items (JSON)', type: 'json' },
  },
  Component: ChecklistBlock,
}

export default ChecklistBlock