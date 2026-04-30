'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface ContactMethod {
  label: string
  value: string
  href?: string
}

function ContactMethodsBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  //const accent = (rawProps.accentColor as string) || '#ffc418'

  let methods: ContactMethod[] = []
  try {
    const raw = rawProps.methods
    methods = typeof raw === 'string' ? JSON.parse(raw) : (raw as ContactMethod[]) ?? []
  } catch {
    methods = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {methods.map((method, i) => {
            const content = (
              <div className="rounded-lg p-6 text-center" style={{ backgroundColor: cardBg }}>
                <h3 className="text-xl text-white font-bold mb-2">{method.label}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{method.value}</p>
              </div>
            )

            return method.href ? (
              <Link key={i} href={method.href}>{content}</Link>
            ) : (
              <div key={i}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const ContactMethodsBlockDefinition: BlockDefinition = {
  type: 'ContactMethodsBlock',
  label: 'Contact Methods',
  category: 'Forms',
  description: 'List support and sales contact channels.',
  defaultProps: {
    heading: 'Contact Us',
    subtitle: 'Choose the channel that works best for you',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    methods: JSON.stringify([
      { label: 'Sales', value: 'sales@company.com', href: 'mailto:sales@company.com' },
      { label: 'Support', value: 'support@company.com', href: 'mailto:support@company.com' },
      { label: 'Phone', value: '+1 (555) 010-2000', href: 'tel:+15550102000' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    methods: { label: 'Methods (JSON)', type: 'json' },
  },
  Component: ContactMethodsBlock,
}

export default ContactMethodsBlock