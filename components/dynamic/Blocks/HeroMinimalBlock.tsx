'use client'

import type { BlockDefinition } from '../types'

// Matches the simple text header used on /blog, /team, /about, and legal pages:
//   - Optional small yellow badge (e.g. "Legal", "Blog")
//   - Title
//   - Subtitle
//   - Left or center aligned

function HeroMinimalBlock(rawProps: Record<string, unknown>) {
  const badge = rawProps.badge as string | undefined
  const title = (rawProps.title as string) || 'Section Title'
  const subtitle = rawProps.subtitle as string | undefined
  const align = (rawProps.align as string) || 'left'
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  const alignClass = align === 'center' ? 'text-center' : 'text-left'
  const maxWClass = align === 'center' ? 'max-w-3xl mx-auto' : 'max-w-3xl'

  return (
    <section className="px-6 md:px-12 lg:px-20 py-16" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        <div className={alignClass}>
          {badge && (
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ color: accent }}
            >
              {badge}
            </p>
          )}

          <h1 className="text-5xl md:text-6xl text-base-content mb-6">{title}</h1>

          {subtitle && (
            <p className={`text-xl ${maxWClass}`} style={{ color: 'oklch(var(--bc) / 0.7)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export const HeroMinimalBlockDefinition: BlockDefinition = {
  type: 'HeroMinimalBlock',
  label: 'Hero — Minimal (Text Only)',
  category: 'Hero',
  description: 'Simple heading + subtitle, optionally with a small badge — used on blog and team pages',
  defaultProps: {
    badge: '',
    title: 'Insights & Perspectives',
    subtitle:
      'Exploring the future of digital transformation in architecture, engineering, construction, and operations.',
    align: 'left',
    bgColor: '',
    accentColor: '',
  },
  schema: {
    badge: {
      label: 'Badge (above title)',
      type: 'text',
      placeholder: 'Optional — e.g. "Legal" or "Blog"',
    },
    title: { label: 'Title', type: 'text', placeholder: 'Section Title' },
    subtitle: { label: 'Subtitle', type: 'textarea', placeholder: 'Descriptive subtitle...' },
    align: { label: 'Alignment', type: 'select', options: ['left', 'center'] },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: HeroMinimalBlock,
}

export default HeroMinimalBlock
