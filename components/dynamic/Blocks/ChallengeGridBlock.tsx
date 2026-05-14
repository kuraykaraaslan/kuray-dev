'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Matches Solutions / "The Real Challenge" section:
//   - Heading with accent + two subtitle lines
//   - 2-column grid of challenge cards (dot bullet + title + description)

interface ChallengeItem {
  title: string
  description: string
}

const DEFAULT_CHALLENGES: ChallengeItem[] = [
  {
    title: 'Disconnected Workflows',
    description:
      "Systems that don't communicate create silos and delays. Teams work in isolation without a shared source of truth.",
  },
  {
    title: 'Overloaded Teams',
    description:
      'Too many tools, not enough clarity or coordination. Professionals spend more time managing tools than delivering results.',
  },
  {
    title: 'AI Without Clear Ownership',
    description:
      'AI initiatives without clear ownership or outcomes. Technology deployed without strategy or accountability.',
  },
  {
    title: 'Technology Without Strategy',
    description:
      'Technology deployed without strategy or accountability leads to wasted investment and frustrated teams.',
  },
]

function parseChallenges(raw: unknown): ChallengeItem[] {
  if (Array.isArray(raw)) return raw as ChallengeItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_CHALLENGES
}

function ChallengeGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle1 = rawProps.subtitle1 as string | undefined
  const subtitle2 = rawProps.subtitle2 as string | undefined
  const challenges = parseChallenges(rawProps.challenges)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle1 || subtitle2) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                {heading}
                {headingAccent && (
                  <> <span className="text-primary">{headingAccent}</span></>
                )}
              </h2>
            )}
            {subtitle1 && (
              <p className="text-lg mb-2 text-base-content/70">
                {subtitle1}
              </p>
            )}
            {subtitle2 && (
              <p className="text-base max-w-2xl mx-auto text-base-content/60">
                {subtitle2}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {challenges.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-lg bg-base-200 border border-base-content/10 hover:border-base-content/20 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-primary" />
                <h3 className="text-2xl text-base-content">{item.title}</h3>
              </div>
              <p className="pl-6 leading-relaxed text-base-content/70">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ChallengeGridBlockDefinition: BlockDefinition = {
  type: 'ChallengeGridBlock',
  label: 'Challenge Grid',
  category: 'Content',
  description:
    'Two-column grid of problem/challenge cards with dot bullet — used in "The Real Challenge"',
  defaultProps: {
    heading: 'The',
    headingAccent: 'Real Challenge',
    subtitle1: "Isn't Technology — It's Complexity",
    subtitle2:
      "Most AECO organizations don't fail because of a lack of tools. They fail because systems don't talk, teams don't align, and decisions are made with incomplete or unreliable data.",
    challenges: DEFAULT_CHALLENGES,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'challenge',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading:       { label: 'Heading (plain part)',   type: 'text' },
    headingAccent: { label: 'Heading Accent (primary color part)', type: 'text' },
    subtitle1:     { label: 'Subtitle Line 1',        type: 'text' },
    subtitle2:     { label: 'Subtitle Line 2 (smaller)', type: 'textarea' },
    challenges: {
      label: 'Challenges',
      type: 'repeater',
      fields: {
        title:       { label: 'Title',       type: 'text',     value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ChallengeGridBlock as unknown as BlockDefinition['Component'],
}

export default ChallengeGridBlock
