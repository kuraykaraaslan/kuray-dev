'use client'

import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function AnnouncementStripBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const message = (rawProps.message as string) || 'Announcement'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 bg-base-200 rounded-lg px-5 py-4">
          <p className="text-base-content">{message}</p>
          {ctaLabel && ctaHref && (
            <Link href={ctaHref} className="font-medium text-primary">
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </BaseBlock>
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
    blockClass: 'bg-base-100 pt-4',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    message: { label: 'Message', type: 'text' },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref: { label: 'CTA Link', type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: AnnouncementStripBlock,
}

export default AnnouncementStripBlock
