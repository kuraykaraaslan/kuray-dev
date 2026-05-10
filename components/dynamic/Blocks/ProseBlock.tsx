'use client'

import type { BlockDefinition } from '../types'

interface Props {
  title?: string
  subtitle?: string
  content?: string
}

function ProseBlock({ title, subtitle, content }: Props) {
  return (
    <section className="min-h-screen bg-base-100 pt-32">
      <div className="container mx-auto px-4 lg:px-8 mb-16 max-w-3xl">
        {title && (
          <h1 className="text-3xl font-bold text-center mb-4">{title}</h1>
        )}
        {subtitle && (
          <p className="text-sm text-base-content/50 text-center mb-10">{subtitle}</p>
        )}
        {content && (
          <div
            className="prose prose-base max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>
    </section>
  )
}

export const ProseBlockDefinition: BlockDefinition = {
  type: 'ProseBlock',
  label: 'Prose Document',
  description: 'Full-page document with title and HTML content — ideal for Privacy Policy, Terms of Use, etc.',
  category: 'Content',
  defaultProps: {
    title: 'Document Title',
    subtitle: 'Last Updated: January 1, 2025',
    content: '<h2>Section</h2><p>Start writing your content here...</p>',
  },
  schema: {
    title: { label: 'Title', type: 'text', placeholder: 'Privacy Policy' },
    subtitle: { label: 'Subtitle / Last Updated', type: 'text', placeholder: 'Last Updated: January 1, 2025' },
    content: { label: 'Content (HTML)', type: 'textarea', placeholder: '<h2>Heading</h2><p>Paragraph...</p>' },
  },
  Component: ProseBlock as unknown as BlockDefinition['Component'],
}
