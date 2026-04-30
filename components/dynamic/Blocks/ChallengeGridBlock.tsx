'use client'

import type { BlockDefinition } from '../types'

// Matches Solutions / "The Real Challenge" section:
//   - Heading with accent + two subtitle lines
//   - 2-column grid of challenge cards (dot bullet + title + description)

interface ChallengeItem {
  title: string
  description: string
}

function ChallengeGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle1 = rawProps.subtitle1 as string | undefined
  const subtitle2 = rawProps.subtitle2 as string | undefined
  const bg = (rawProps.bgColor as string) || '#1f1d1d'
  const cardBg = (rawProps.cardBgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let challenges: ChallengeItem[] = []
  try {
    const raw = rawProps.challenges
    challenges = typeof raw === 'string' ? JSON.parse(raw) : (raw as ChallengeItem[]) ?? []
  } catch {
    challenges = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle1 || subtitle2) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-white mb-4">
                {heading}
                {headingAccent && (
                  <> <span style={{ color: accent }}>{headingAccent}</span></>
                )}
              </h2>
            )}
            {subtitle1 && (
              <p className="text-lg mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle1}
              </p>
            )}
            {subtitle2 && (
              <p className="text-base max-w-2xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {subtitle2}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {challenges.map((item, i) => (
            <div
              key={i}
              className="p-8 rounded-lg border border-white/10 hover:border-white/20 transition-all"
              style={{ backgroundColor: cardBg }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                  style={{ backgroundColor: accent }}
                />
                <h3 className="text-2xl text-white">{item.title}</h3>
              </div>
              <p className="pl-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultChallenges: ChallengeItem[] = [
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
    challenges: JSON.stringify(defaultChallenges, null, 2),
    bgColor: '#1f1d1d',
    cardBgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    heading: { label: 'Heading (white part)', type: 'text' },
    headingAccent: { label: 'Heading Accent (yellow part)', type: 'text' },
    subtitle1: { label: 'Subtitle Line 1', type: 'text' },
    subtitle2: { label: 'Subtitle Line 2 (smaller)', type: 'textarea' },
    challenges: {
      label: 'Challenges (JSON array)',
      type: 'json',
      placeholder: '[{"title":"Title","description":"Description"}]',
    },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: ChallengeGridBlock,
}

export default ChallengeGridBlock
