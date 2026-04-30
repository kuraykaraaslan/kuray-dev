'use client'

import Image from 'next/image'
import type { BlockDefinition } from '../types'

interface TeamMember {
  name: string
  title: string
  bio?: string
  image?: string
  socials?: {
    twitter?: string
    linkedin?: string
    email?: string
  }
}

function TeamMembersBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let members: TeamMember[] = []
  try {
    const raw = rawProps.members
    members = typeof raw === 'string' ? JSON.parse(raw) : (raw as TeamMember[]) ?? []
  } catch {
    members = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          {members.map((member, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden text-center hover:shadow-xl transition"
              style={{ backgroundColor: cardBg }}
            >
              {member.image && (
                <div className="relative w-full h-64 mb-4">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl text-base-content font-bold mb-1">{member.name}</h3>
                <p className="text-sm mb-3" style={{ color: accent }}>
                  {member.title}
                </p>

                {member.bio && (
                  <p className="text-sm mb-4" style={{ color: 'oklch(var(--bc) / 0.6)' }}>
                    {member.bio}
                  </p>
                )}

                {member.socials && (
                  <div className="flex justify-center gap-3">
                    {member.socials.twitter && (
                      <a href={member.socials.twitter} className="text-sm" style={{ color: accent }}>
                        𝕏
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} className="text-sm" style={{ color: accent }}>
                        in
                      </a>
                    )}
                    {member.socials.email && (
                      <a href={`mailto:${member.socials.email}`} className="text-sm" style={{ color: accent }}>
                        ✉️
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const TeamMembersBlockDefinition: BlockDefinition = {
  type: 'TeamMembersBlock',
  label: 'Team Members',
  category: 'People',
  description: 'Showcase team members with profiles.',
  defaultProps: {
    heading: 'Meet the Team',
    subtitle: 'Great people building great products',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    members: JSON.stringify([
      {
        name: 'John Doe',
        title: 'CEO & Founder',
        bio: 'Visionary leader with 15+ years in tech',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        socials: { linkedin: 'https://linkedin.com' },
      },
      {
        name: 'Jane Smith',
        title: 'CTO',
        bio: 'Tech innovator and architecture expert',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        socials: { linkedin: 'https://linkedin.com' },
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    members: { label: 'Team Members (JSON)', type: 'json' },
  },
  Component: TeamMembersBlock,
}

export default TeamMembersBlock
