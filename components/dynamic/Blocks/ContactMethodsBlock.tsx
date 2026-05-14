'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ContactMethod {
  label: string
  value: string
  href?: string
}

function ContactMethodsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let methods: ContactMethod[] = []
  try {
    const raw = rawProps.methods
    methods = typeof raw === 'string' ? JSON.parse(raw) : (raw as ContactMethod[]) ?? []
  } catch {
    methods = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:px-12 lg:px-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {methods.map((method, i) => {
            const content = (
              <div className="bg-base-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-2 text-base-content">
                  {method.label}
                </h3>
                <p className="text-base-content/70">{method.value}</p>
              </div>
            )

            return method.href ? (
              <Link key={i} href={method.href}>
                {content}
              </Link>
            ) : (
              <div key={i}>{content}</div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ContactMethodsBlockDefinition: BlockDefinition = {
  type: 'ContactMethodsBlock',
  label: 'Contact Methods',
  category: 'Forms',
  description: 'Grid of contact channels (email, phone, etc.) with optional links.',
  defaultProps: {
    heading: 'Contact Us',
    subtitle: 'Choose the channel that works best for you',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'contact-methods',
    methods: [
      { label: 'Sales', value: 'sales@example.com', href: 'mailto:sales@example.com' },
      { label: 'Support', value: 'support@example.com', href: 'mailto:support@example.com' },
      { label: 'Phone', value: '+1 (555) 010-2000', href: 'tel:+15550102000' },
    ],
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    methods: {
      label: 'Contact Methods',
      type: 'repeater',
      fields: {
        label: { label: 'Label', type: 'text', value: '' },
        value: { label: 'Display Value', type: 'text', value: '' },
        href: { label: 'Link URL (optional)', type: 'url', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ContactMethodsBlock as unknown as BlockDefinition['Component'],
}

export default ContactMethodsBlock
