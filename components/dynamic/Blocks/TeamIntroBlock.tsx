'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function TeamIntroBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const body = rawProps.body as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
        {subtitle && <p className="text-lg mb-6 text-primary">{subtitle}</p>}
        {body && <p className="text-lg leading-relaxed text-base-content/70">{body}</p>}
      </div>
    </BaseBlock>
  )
}

export const TeamIntroBlockDefinition: BlockDefinition = {
  type: 'TeamIntroBlock',
  label: 'Team Intro',
  category: 'People',
  description: 'Introductory copy block for the team or leadership section.',
  defaultProps: {
    heading: 'Leadership Team',
    subtitle: 'Experienced operators building enterprise-grade products',
    body: 'We combine product thinking, engineering rigor, and enterprise delivery experience to help customers ship reliably at scale.',
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-200',
    sectionId: 'team-intro',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    body: { label: 'Body', type: 'textarea' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TeamIntroBlock as unknown as BlockDefinition['Component'],
}

export default TeamIntroBlock
