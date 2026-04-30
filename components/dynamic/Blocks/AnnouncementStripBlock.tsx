'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function AnnouncementStripBlock(rawProps: Record<string, unknown>) {
  const message = (rawProps.message as string) || 'Announcement'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  return (
    <section className="px-6 md:px-12 lg:px-20 py-4" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 rounded-lg px-5 py-4 bg-base-300">
        <p className="text-base-content">{message}</p>
        {ctaLabel && ctaHref && (
          <Link href={ctaHref} className="font-medium" style={{ color: accent }}>
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const AnnouncementStripBlockDefinition: BlockDefinition = {
  type: 'AnnouncementStripBlock',
  label: 'Announcement Strip',
  category: 'Content',
  description: 'Small announcement bar for product or company updates.',
  defaultProps: {
    message: 'New: enterprise SSO, audit logs, and granular permissions are now available.',
    ctaLabel: 'View Details',
    ctaHref: '/updates',
    bgColor: '',
    accentColor: '',
  },
  schema: {
    message: { label: 'Message', type: 'text' },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref: { label: 'CTA Link', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: AnnouncementStripBlock,
}

export default AnnouncementStripBlock