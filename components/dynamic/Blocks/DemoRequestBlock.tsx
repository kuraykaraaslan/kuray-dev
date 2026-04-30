'use client'

import { useState } from 'react'
import type { BlockDefinition } from '../types'

function DemoRequestBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const buttonLabel = (rawProps.buttonLabel as string) || 'Request Demo'
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto rounded-lg p-8 md:p-12" style={{ backgroundColor: cardBg }}>
        <div className="text-center mb-8">
          {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
          {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
        </div>

        {submitted ? (
          <div className={`text-center rounded-md py-4${!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}>
            Thank you. Our team will reach out shortly.
          </div>
        ) : (
          <form
            className="grid md:grid-cols-2 gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <input className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-base-content" placeholder="Full name" required />
            <input type="email" className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-base-content" placeholder="Work email" required />
            <input className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-base-content md:col-span-2" placeholder="Company" />
            <textarea className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-base-content md:col-span-2" rows={4} placeholder="Tell us about your goals" />
            <button className={`md:col-span-2 px-6 py-3 rounded-md font-medium${!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}>
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export const DemoRequestBlockDefinition: BlockDefinition = {
  type: 'DemoRequestBlock',
  label: 'Demo Request',
  category: 'Forms',
  description: 'Lead capture form for demo requests.',
  defaultProps: {
    heading: 'Book a Demo',
    subtitle: 'See how the platform fits your team',
    buttonLabel: 'Request Demo',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    buttonLabel: { label: 'Button Label', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: DemoRequestBlock,
}

export default DemoRequestBlock