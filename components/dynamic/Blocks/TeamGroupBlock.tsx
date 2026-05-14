'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface TeamMember {
  name: string
  role: string
}

function parseMembers(raw: unknown): TeamMember[] {
  if (Array.isArray(raw)) return raw as TeamMember[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function TeamGroupBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const members = parseMembers(rawProps.members)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {heading && <h2 className="text-3xl text-base-content mb-10">{heading}</h2>}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, i) => (
            <div
              key={i}
              className="p-6 rounded-lg border border-base-content/10 hover:border-base-content/20 transition-all bg-base-200"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-xl font-bold bg-primary text-primary-content">
                {member.name.charAt(0)}
              </div>
              <h3 className="text-xl text-base-content mb-1">{member.name}</h3>
              <p className="text-sm text-primary">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const TeamGroupBlockDefinition: BlockDefinition = {
  type: 'TeamGroupBlock',
  label: 'Team Group',
  category: 'People',
  description: 'A labelled section of team member cards — initial avatar, name, role. Stack multiple blocks for Leadership / Directors / Managers etc.',
  defaultProps: {
    heading: 'Leadership',
    members: [
      { name: 'Leo Salce', role: 'Founder & CEO' },
      { name: 'Armin Emami', role: 'Founder & COO' },
      { name: 'Hamidreza Rezazadeh', role: 'Director of Middle East' },
    ],
    blockClass: 'px-6 md:px-12 lg:px-20 py-16 bg-base-300',
    sectionId: 'team-group',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Group Heading', type: 'text', placeholder: 'Leadership' },
    members: {
      label: 'Members',
      type: 'repeater',
      fields: {
        name: { label: 'Name', type: 'text', value: '' },
        role: { label: 'Role', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TeamGroupBlock as unknown as BlockDefinition['Component'],
}

export default TeamGroupBlock
