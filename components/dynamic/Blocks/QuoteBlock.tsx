'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function QuoteBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const quote = (rawProps.quote as string) || 'Your quote here.'
  const author = rawProps.author as string | undefined
  const role = rawProps.role as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-6xl mb-6 text-primary">
            &ldquo;
          </div>
          <blockquote className="text-3xl md:text-4xl leading-tight mb-8 text-base-content">
            {quote}
          </blockquote>
          {(author || role) && (
            <div className="opacity-80 text-base-content">
              {author && <div className="text-lg font-semibold">{author}</div>}
              {role && <div className="text-sm mt-1">{role}</div>}
            </div>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const QuoteBlockDefinition: BlockDefinition = {
  type: 'QuoteBlock',
  label: 'Quote',
  category: 'Content',
  description: 'Highlight a quote, testimonial, or positioning statement.',
  defaultProps: {
    quote: 'Enterprise-grade software should feel powerful, not complicated.',
    author: 'Kuray Karaaslan',
    role: 'Product Philosophy',
    blockClass: 'bg-base-300',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    quote: { label: 'Quote', type: 'textarea' },
    author: { label: 'Author', type: 'text' },
    role: { label: 'Role / Context', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: QuoteBlock as unknown as BlockDefinition['Component'],
}

export default QuoteBlock
