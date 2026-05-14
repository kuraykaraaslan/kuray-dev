'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface BadgeItem {
  label: string
  description?: string
}

const DEFAULT_BADGES: BadgeItem[] = [
  { label: 'SOC 2 Ready', description: 'Processes designed with auditability in mind' },
  { label: 'SSO / SAML', description: 'Single sign-on support for identity teams' },
  { label: 'Role-Based Access', description: 'Fine-grained permissions and controls' },
]

function parseBadges(raw: unknown): BadgeItem[] {
  if (Array.isArray(raw)) return raw as BadgeItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_BADGES
}

function SecurityBadgesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const badges = parseBadges(rawProps.badges)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
            )}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {badges.map((badge, i) => (
            <div
              key={i}
              className="bg-base-200 rounded-lg p-6 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4 text-2xl font-bold bg-primary text-primary-content">
                ✓
              </div>
              <h3 className="text-xl text-base-content font-bold mb-2">{badge.label}</h3>
              {badge.description && (
                <p className="text-base-content/70">{badge.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const SecurityBadgesBlockDefinition: BlockDefinition = {
  type: 'SecurityBadgesBlock',
  label: 'Security Badges',
  category: 'Trust',
  description: 'Display certifications, compliance, and security assurances.',
  defaultProps: {
    heading: 'Security & Compliance',
    subtitle: 'Enterprise-grade safeguards you can trust',
    badges: DEFAULT_BADGES,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'security',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    badges: {
      label: 'Badges',
      type: 'repeater',
      fields: {
        label:       { label: 'Label',       type: 'text',     value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: SecurityBadgesBlock as unknown as BlockDefinition['Component'],
}

export default SecurityBadgesBlock
