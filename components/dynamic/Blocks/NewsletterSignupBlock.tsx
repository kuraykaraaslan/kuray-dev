'use client'

import { useState } from 'react'
import type { BlockDefinition } from '../types'

function NewsletterSignupBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const placeholder = (rawProps.placeholder as string) || 'Enter your email'
  const buttonLabel = (rawProps.buttonLabel as string) || 'Subscribe'
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'
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
    <section className="py-16 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-2xl mx-auto text-center">
        {heading && <h2 className="text-3xl md:text-4xl text-base-content mb-4">{heading}</h2>}
        {subtitle && (
          <p className="text-lg mb-8" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
            {subtitle}
          </p>
        )}

        {submitted ? (
          <div
            className={`p-4 rounded-md text-center font-medium{!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}
          >
            ✓ Thank you! Check your email for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-4 py-3 rounded-md text-base-content border border-white/20 focus:border-white/50 focus:outline-none"
              style={{ backgroundColor: 'oklch(var(--bc) / 0.1)' }}
              required
            />
            <button
              type="submit"
              className={`px-8 py-3 rounded-md font-medium transition-transform hover:scale-105{!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}
            >
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
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
    bgColor: '',
    accentColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    placeholder: { label: 'Input Placeholder', type: 'text' },
    buttonLabel: { label: 'Button Label', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: NewsletterSignupBlock,
}

export default NewsletterSignupBlock
