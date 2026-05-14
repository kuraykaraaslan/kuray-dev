'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Simple text header used on blog, team, about, and legal pages:
//   - Optional small accent badge (e.g. "Legal", "Blog")
//   - Title
//   - Subtitle
//   - Left or center aligned

function HeroMinimalBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const badge = rawProps.badge as string | undefined
  const title = (rawProps.title as string) || 'Section Title'
  const subtitle = rawProps.subtitle as string | undefined
  const align = (rawProps.align as string) || 'left'

  const ALIGN_CLASS: Record<string, string> = {
    left: 'text-left',
    center: 'text-center',
  }
  const MAX_W_CLASS: Record<string, string> = {
    left: 'max-w-3xl',
    center: 'max-w-3xl mx-auto',
  }

  const alignClass = ALIGN_CLASS[align] ?? 'text-left'
  const maxWClass = MAX_W_CLASS[align] ?? 'max-w-3xl'

  return (
    <BaseBlock {...baseProps}>
      <div className="px-6 md:px-12 lg:px-20 py-16">
        <div className="max-w-7xl mx-auto">
          <div className={alignClass}>
            {badge && (
              <p className="text-sm font-semibold tracking-widest uppercase mb-3 text-primary">
                {badge}
              </p>
            )}

            <h1 className="text-5xl md:text-6xl text-base-content mb-6">{title}</h1>

            {subtitle && (
              <p className={`text-xl text-base-content/70 ${maxWClass}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const HeroMinimalBlockDefinition: BlockDefinition = {
  type: 'HeroMinimalBlock',
  label: 'Hero — Minimal (Text Only)',
  category: 'Hero',
  description:
    'Simple heading + subtitle, optionally with a small badge — used on blog and team pages',
  defaultProps: {
    badge: '',
    title: 'Insights & Perspectives',
    subtitle:
      'Exploring the future of digital transformation in architecture, engineering, construction, and operations.',
    align: 'left',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
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
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HeroMinimalBlock as unknown as BlockDefinition['Component'],
}

export default HeroMinimalBlock
