'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function NotificationBannerBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const message = (rawProps.message as string) || 'New release available.'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto rounded-lg px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-base-200">
        <p className="text-base-content">{message}</p>
        {ctaLabel && ctaHref && (
          <Link
            href={ctaHref}
            className="btn btn-primary px-5 py-2 rounded-md font-medium"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </BaseBlock>
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
    blockClass: 'px-6 md:px-12 lg:px-20 py-6 bg-base-100',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    message:  { label: 'Message',   type: 'text' },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref:  { label: 'CTA Link',  type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: NotificationBannerBlock as unknown as BlockDefinition['Component'],
}

export default NotificationBannerBlock
