'use client'

import { useState } from 'react'
import type { BlockDefinition } from '../types'

function DemoRequestBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const buttonLabel = (rawProps.buttonLabel as string) || 'Request Demo'
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto rounded-lg p-8 md:p-12" style={{ backgroundColor: cardBg }}>
        <div className="text-center mb-8">
          {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
          {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
        </div>

        {submitted ? (
          <div className="text-center rounded-md py-4" style={{ backgroundColor: accent, color: bg }}>
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
            <input className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-white" placeholder="Full name" required />
            <input type="email" className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-white" placeholder="Work email" required />
            <input className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-white md:col-span-2" placeholder="Company" />
            <textarea className="px-4 py-3 rounded-md bg-transparent border border-white/20 text-white md:col-span-2" rows={4} placeholder="Tell us about your goals" />
            <button className="md:col-span-2 px-6 py-3 rounded-md font-medium" style={{ backgroundColor: accent, color: bg }}>
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
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
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