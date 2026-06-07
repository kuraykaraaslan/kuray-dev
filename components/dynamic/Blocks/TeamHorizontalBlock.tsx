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
    name: 'Sarah Johnson',
    title: 'CEO & Co-Founder',
    bio: 'Visionary leader with 15+ years building products people love. Passionate about design and sustainable growth.',
    image: '',
    linkedin: 'https://linkedin.com',
  },
  {
    name: 'Marcus Lee',
    title: 'CTO',
    bio: 'Full-stack engineer turned architect. Led engineering teams at three successful startups before joining us.',
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

// Mobile: horizontal cards are always 1 col (too cramped otherwise).
// Vertical cards: 1 col for ≤2 desktop cols, 2 cols for ≥3 desktop cols.
function gridCols(columns: string, layout: string): string {
  const col = parseInt(columns, 10) || 1
  const mob = layout === 'vertical' && col >= 3 ? 'grid-cols-2' : 'grid-cols-1'
  const map: Record<number, string> = {
    1: `${mob}`,
    2: `${mob} md:grid-cols-2`,
    3: `${mob} md:grid-cols-2 lg:grid-cols-3`,
    4: `${mob} md:grid-cols-3 lg:grid-cols-4`,
    5: `${mob} md:grid-cols-3 lg:grid-cols-5`,
    6: `${mob} md:grid-cols-4 lg:grid-cols-6`,
  }
  return map[col] ?? mob
}

const MAX_WIDTH: Record<string, string> = {
  '1': 'max-w-4xl',
  '2': 'max-w-5xl',
  '3': 'max-w-7xl',
  '4': 'max-w-7xl',
  '5': 'max-w-7xl',
  '6': 'max-w-7xl',
}

function MemberPhoto({ member, size }: { member: TeamMember; size: string }) {
  return member.image ? (
    <div className={`relative ${size} rounded-xl overflow-hidden flex-shrink-0`}>
      <Image src={member.image} alt={member.name} fill className="object-cover" sizes={size} />
    </div>
  ) : (
    <div className={`${size} rounded-xl bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary flex-shrink-0`}>
      {member.name.charAt(0)}
    </div>
  )
}

function SocialLinks({ member }: { member: TeamMember }) {
  return (
    <div className="flex gap-3">
      {member.twitter && (
        <a href={member.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-base-content/50 hover:text-primary transition-colors" aria-label="Twitter">𝕏</a>
      )}
      {member.linkedin && (
        <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-base-content/50 hover:text-primary transition-colors" aria-label="LinkedIn">in</a>
      )}
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-sm text-base-content/50 hover:text-primary transition-colors" aria-label="Email">✉</a>
      )}
    </div>
  )
}

function TeamHorizontalBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const members = parseMembers(rawProps.members)
  const columns = (rawProps.columns as string) || '1'
  const layout = (rawProps.layout as string) || 'horizontal'
  const isVertical = layout === 'vertical'

  return (
    <BaseBlock {...baseProps}>
      <div className={`relative z-10 ${MAX_WIDTH[columns] ?? 'max-w-4xl'} mx-auto px-6 md:px-12 lg:px-20 py-20`}>
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className={`grid gap-6 ${gridCols(columns, layout)}`}>
          {members.map((member, i) =>
            isVertical ? (
              <div key={i} className="flex flex-col rounded-xl bg-base-200 hover:shadow-lg transition-shadow overflow-hidden">
                {member.image ? (
                  <div className="relative w-full aspect-[4/3]">
                    <Image src={member.image} alt={member.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] bg-primary/10 flex items-center justify-center text-5xl font-bold text-primary">
                    {member.name.charAt(0)}
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-base-content mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{member.title}</p>
                  {member.bio && (
                    <p className="text-sm text-base-content/60 leading-relaxed mb-4 flex-1">{member.bio}</p>
                  )}
                  <SocialLinks member={member} />
                </div>
              </div>
            ) : (
              <div key={i} className="flex flex-col sm:flex-row gap-6 p-6 rounded-xl bg-base-200 hover:shadow-lg transition-shadow">
                <MemberPhoto member={member} size="w-36 h-36" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-base-content mb-1">{member.name}</h3>
                  <p className="text-sm font-medium text-primary mb-3">{member.title}</p>
                  {member.bio && (
                    <p className="text-sm text-base-content/60 leading-relaxed mb-4">{member.bio}</p>
                  )}
                  <SocialLinks member={member} />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const TeamHorizontalBlockDefinition: BlockDefinition = {
  type: 'TeamHorizontalBlock',
  label: 'Team — Horizontal',
  category: 'People',
  description: 'Team member cards with photo on the left and bio on the right.',
  icon: '👥',
  defaultProps: {
    heading: 'Meet the Team',
    subtitle: 'The people behind the product',
    members: DEFAULT_MEMBERS,
    layout: 'horizontal',
    columns: '1',
    blockClass: 'bg-base-100 py-4',
    sectionId: 'team',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    layout: {
      label: 'Card Layout',
      type: 'select',
      options: [
        { label: 'Horizontal (photo left)', value: 'horizontal' },
        { label: 'Vertical (photo top)', value: 'vertical' },
      ],
    },
    columns: {
      label: 'Columns per Row',
      type: 'select',
      options: [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
        { label: '5', value: '5' },
      ],
    },
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
  Component: TeamHorizontalBlock as unknown as BlockDefinition['Component'],
}

export default TeamHorizontalBlock
