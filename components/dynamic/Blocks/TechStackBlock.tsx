'use client'

import type { BlockDefinition } from '../types'

interface TechItem {
  name: string
  description?: string
  icon?: string
}

function TechStackBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'

  let technologies: TechItem[] = []
  try {
    const raw = rawProps.technologies
    technologies = typeof raw === 'string' ? JSON.parse(raw) : (raw as TechItem[]) ?? []
  } catch {
    technologies = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {technologies.map((tech, i) => (
            <div key={i} className="rounded-lg p-6" style={{ backgroundColor: cardBg }}>
              <div className="flex items-center gap-4 mb-3">
                {tech.icon && <span className="text-3xl">{tech.icon}</span>}
                <h3 className="text-xl text-white font-bold">{tech.name}</h3>
              </div>
              {tech.description && (
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{tech.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
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
    bgColor: '#282626',
    cardBgColor: '#323030',
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
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    technologies: { label: 'Technologies (JSON)', type: 'json' },
  },
  Component: TechStackBlock,
}

export default TechStackBlock