'use client'

import { useState } from 'react'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function NewsletterSignupBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const placeholder = (rawProps.placeholder as string) || 'Enter your email'
  const buttonLabel = (rawProps.buttonLabel as string) || 'Subscribe'

  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {heading && (
          <h2 className="text-3xl md:text-4xl text-base-content mb-4">{heading}</h2>
        )}
        {subtitle && (
          <p className="text-lg mb-8 text-base-content/70">
            {subtitle}
          </p>
        )}

        {submitted ? (
          <div className="alert alert-success p-4 rounded-md text-center font-medium">
            Thank you! Check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="input input-bordered flex-1"
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
            >
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </BaseBlock>
  )
}

export const NewsletterSignupBlockDefinition: BlockDefinition = {
  type: 'NewsletterSignupBlock',
  label: 'Newsletter Signup',
  category: 'Forms',
  description: 'Email newsletter subscription form.',
  defaultProps: {
    heading: 'Stay Updated',
    subtitle: 'Subscribe to our newsletter for the latest updates and insights.',
    placeholder: 'Enter your email address',
    buttonLabel: 'Subscribe',
    blockClass: 'bg-base-200 py-16 px-6 md:px-12 lg:px-20',
    sectionId: 'newsletter',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:     { label: 'Heading',           type: 'text' },
    subtitle:    { label: 'Subtitle',          type: 'textarea' },
    placeholder: { label: 'Input Placeholder', type: 'text' },
    buttonLabel: { label: 'Button Label',      type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: NewsletterSignupBlock as unknown as BlockDefinition['Component'],
}

export default NewsletterSignupBlock
