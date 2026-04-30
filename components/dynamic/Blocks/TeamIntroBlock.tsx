'use client'

import type { BlockDefinition } from '../types'

function TeamIntroBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const body = rawProps.body as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-4xl mx-auto text-center">
        {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
        {subtitle && <p className="text-lg mb-6" style={{ color: accent }}>{subtitle}</p>}
        {body && <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{body}</p>}
      </div>
    </section>
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
    bgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    body: { label: 'Body', type: 'textarea' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: TeamIntroBlock,
}

export default TeamIntroBlock