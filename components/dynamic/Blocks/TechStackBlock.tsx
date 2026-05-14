'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface TechItem {
  name: string
  description?: string
  icon?: string
}

function TechStackBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let technologies: TechItem[] = []
  try {
    const raw = rawProps.technologies
    technologies = typeof raw === 'string' ? JSON.parse(raw) : (raw as TechItem[]) ?? []
  } catch {
    technologies = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg text-base-content/70">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {technologies.map((tech, i) => (
            <div key={i} className="bg-base-200 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-3">
                {tech.icon && <span className="text-3xl">{tech.icon}</span>}
                <h3 className="text-xl text-base-content font-bold">{tech.name}</h3>
              </div>
              {tech.description && (
                <p className="text-base-content/70">{tech.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const TechStackBlockDefinition: BlockDefinition = {
  type: 'TechStackBlock',
  label: 'Tech Stack',
  category: 'Features',
  description: 'Showcase the technologies and tools you use.',
  defaultProps: {
    heading: 'Technology Stack',
    subtitle: 'Built with modern, scalable tools',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
    technologies: JSON.stringify([
      { name: 'Next.js', icon: '▲', description: 'Fast, modern React applications' },
      { name: 'TypeScript', icon: 'TS', description: 'Type-safe development' },
      { name: 'PostgreSQL', icon: 'PG', description: 'Reliable relational data layer' },
      { name: 'Redis', icon: 'R', description: 'Caching and queue infrastructure' },
      { name: 'Prisma', icon: 'P', description: 'Schema-first database access' },
      { name: 'Tailwind CSS', icon: 'TW', description: 'Rapid, consistent UI styling' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    technologies: {
      label: 'Technologies',
      type: 'repeater',
      fields: {
        name: { label: 'Name', type: 'text', value: '' },
        icon: { label: 'Icon (emoji or short text)', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TechStackBlock as unknown as BlockDefinition['Component'],
}

export default TechStackBlock
