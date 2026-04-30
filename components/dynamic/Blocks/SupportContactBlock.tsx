'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function SupportContactBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const supportEmail = (rawProps.supportEmail as string) || 'support@company.com'
  const supportHref = (rawProps.supportHref as string) || 'mailto:support@company.com'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-5xl mx-auto rounded-lg p-8 md:p-10" style={{ backgroundColor: cardBg }}>
        <div className="text-center mb-8">
          {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
          {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={supportHref} className="px-6 py-3 rounded-md font-medium text-center" style={{ backgroundColor: accent, color: bg }}>
            {supportEmail}
          </Link>
          <Link href="/help" className="px-6 py-3 rounded-md font-medium text-center border border-white/20 text-white">
            Help Center
          </Link>
        </div>
      </div>
    </section>
  )
}

export const SupportContactBlockDefinition: BlockDefinition = {
  type: 'SupportContactBlock',
  label: 'Support Contact',
  category: 'Support',
  description: 'Prominent support contact and help center CTA.',
  defaultProps: {
    heading: 'Need Help?',
    subtitle: 'Our support team is available to assist you.',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    supportEmail: 'support@company.com',
    supportHref: 'mailto:support@company.com',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    supportEmail: { label: 'Support Email', type: 'text' },
    supportHref: { label: 'Support Link', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: SupportContactBlock,
}

export default SupportContactBlock