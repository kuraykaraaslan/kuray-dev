'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function NotificationBannerBlock(rawProps: Record<string, unknown>) {
  const message = (rawProps.message as string) || 'New release available.'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  return (
    <section className="px-6 md:px-12 lg:px-20 py-6" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto rounded-lg px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-base-300">
        <p className="text-base-content">{message}</p>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className={`px-5 py-2 rounded-md font-medium{!accent ? ' bg-primary text-primary-content' : ''}`} style={accent ? { backgroundColor: accent, color: 'oklch(var(--pc))' } : undefined}
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const NotificationBannerBlockDefinition: BlockDefinition = {
  type: 'NotificationBannerBlock',
  label: 'Notification Banner',
  category: 'Content',
  description: 'Display a top banner announcement or alert.',
  defaultProps: {
    message: 'Security update: all enterprise accounts now support SSO and SCIM provisioning.',
    ctaLabel: 'Learn More',
    ctaHref: '/security',
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
  Component: NotificationBannerBlock,
}

export default NotificationBannerBlock