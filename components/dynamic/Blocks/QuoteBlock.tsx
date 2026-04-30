'use client'

import type { BlockDefinition } from '../types'

function QuoteBlock(rawProps: Record<string, unknown>) {
  const quote = (rawProps.quote as string) || 'Your quote here.'
  const author = rawProps.author as string | undefined
  const role = rawProps.role as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-6xl mb-6" style={{ color: accent }}>
          “
        </div>
        <blockquote className="text-3xl md:text-4xl text-base-content leading-tight mb-8">
          {quote}
        </blockquote>
        {(author || role) && (
          <div style={{ color: 'oklch(var(--bc) / 0.7)' }}>
            {author && <div className="text-lg font-semibold text-base-content">{author}</div>}
            {role && <div className="text-sm mt-1">{role}</div>}
          </div>
        )}
      </div>
    </section>
  )
}

export const QuoteBlockDefinition: BlockDefinition = {
  type: 'QuoteBlock',
  label: 'Quote',
  category: 'Content',
  description: 'Highlight a quote, testimonial, or positioning statement.',
  defaultProps: {
    quote: 'Enterprise-grade software should feel powerful, not complicated.',
    author: 'AvantLeap Team',
    role: 'Product Philosophy',
    bgColor: '',
    accentColor: '',
  },
  schema: {
    quote: { label: 'Quote', type: 'textarea' },
    author: { label: 'Author', type: 'text' },
    role: { label: 'Role / Context', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: QuoteBlock,
}

export default QuoteBlock