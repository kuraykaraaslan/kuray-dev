'use client'

import Image from 'next/image'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface TeamMember {
  name: string
  title: string
  bio?: string
  image?: string
  twitter?: string
  linkedin?: string
  email?: string
}

const DEFAULT_MEMBERS: TeamMember[] = [
  {
    name: 'John Doe',
    title: 'CEO & Founder',
    bio: 'Visionary leader with 15+ years in tech',
    image: '',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Jane Smith',
    title: 'CTO',
    bio: 'Tech innovator and architecture expert',
    image: '',
    linkedin: 'https://linkedin.com',
  },
]

function parseMembers(raw: unknown): TeamMember[] {
  if (Array.isArray(raw)) return raw as TeamMember[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_MEMBERS
}

function TeamMembersBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const members = parseMembers(rawProps.members)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3 lg:grid-cols-4">
          {members.map((member, i) => (
            <div
              key={i}
              className="rounded-lg overflow-hidden text-center hover:shadow-xl transition bg-base-200"
            >
              {member.image && (
                <div className="relative w-full h-64">
                  <Image src={member.image} alt={member.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl text-base-content font-bold mb-1">{member.name}</h3>
                <p className="text-sm text-primary mb-3">{member.title}</p>
                {member.bio && (
                  <p className="text-sm mb-4 text-base-content/60">{member.bio}</p>
                )}
                <div className="flex justify-center gap-3">
                  {member.twitter && (
                    <a href={member.twitter} className="text-sm text-primary">𝕏</a>
                  )}
                  {member.linkedin && (
                    <a href={member.linkedin} className="text-sm text-primary">in</a>
                  )}
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-sm text-primary">✉</a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    members: DEFAULT_MEMBERS,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'team',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    members: {
      label: 'Members',
      type: 'repeater',
      fields: {
        name: { label: 'Name', type: 'text', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        bio: { label: 'Bio', type: 'textarea', value: '' },
        image: { label: 'Photo', type: 'img', uploadFolder: 'content', value: '' },
        twitter: { label: 'Twitter URL', type: 'url', value: '' },
        linkedin: { label: 'LinkedIn URL', type: 'url', value: '' },
        email: { label: 'Email', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TeamMembersBlock as unknown as BlockDefinition['Component'],
}

export default TeamMembersBlock
