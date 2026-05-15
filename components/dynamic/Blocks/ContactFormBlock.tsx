'use client'

import dynamic from 'next/dynamic'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

const Form = dynamic(
  () => import('@/components/frontend/Features/Hero/Contact/Partials/Form'),
  { ssr: false }
)

function ContactFormBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const heading = (rawProps.heading as string) || 'Send Us a Message'
  const subtitle = rawProps.subtitle as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20 md:px-12 lg:px-20">
        {heading && (
          <h2 className="text-4xl font-bold mb-4 text-base-content">{heading}</h2>
        )}
        {subtitle && (
          <p className="mb-8 text-base-content/70">{subtitle}</p>
        )}

        <Form token="" />
      </div>
    </BaseBlock>
  )
}

export const ContactFormBlockDefinition: BlockDefinition = {
  type: 'ContactFormBlock',
  label: 'Contact Form',
  category: 'Forms',
  description: 'Standalone contact form — posts to /api/contact/form.',
  defaultProps: {
    heading: 'Send Us a Message',
    subtitle: "Fill in the form below and we'll get back to you shortly.",
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'contact-form',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ContactFormBlock as unknown as BlockDefinition['Component'],
}

export default ContactFormBlock
