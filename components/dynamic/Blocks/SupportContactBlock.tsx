'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function SupportContactBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const supportEmail = (rawProps.supportEmail as string) || 'support@company.com'
  const supportHref = (rawProps.supportHref as string) || 'mailto:support@company.com'
  const helpHref = (rawProps.helpHref as string) || '/help'
  const helpLabel = (rawProps.helpLabel as string) || 'Help Center'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-5xl mx-auto bg-base-200 rounded-lg p-8 md:p-10">
        <div className="text-center mb-8">
          {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
          {subtitle && (
            <p className="text-lg text-base-content/70">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={supportHref} className="btn btn-primary text-center">
            {supportEmail}
          </Link>
          <Link href={helpHref} className="btn btn-outline text-center">
            {helpLabel}
          </Link>
        </div>
      </div>
    </BaseBlock>
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
    supportEmail: 'support@company.com',
    supportHref: 'mailto:support@company.com',
    helpHref: '/help',
    helpLabel: 'Help Center',
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'support-contact',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:      { label: 'Heading',                    type: 'text' },
    subtitle:     { label: 'Subtitle',                   type: 'text' },
    supportEmail: { label: 'Support Email Display Text', type: 'text' },
    supportHref:  { label: 'Support Link (href)',        type: 'url'  },
    helpLabel:    { label: 'Help Button Label',          type: 'text' },
    helpHref:     { label: 'Help Button Link (href)',    type: 'url'  },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: SupportContactBlock as unknown as BlockDefinition['Component'],
}

export default SupportContactBlock
