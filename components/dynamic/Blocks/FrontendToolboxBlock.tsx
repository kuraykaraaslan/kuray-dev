'use client'

import type { BlockDefinition } from '../types'

interface Tool {
  name: string
  icon: string
  description?: string
}

interface ToolCategory {
  label: string
  tools: Tool[]
}

const DEFAULT_CATEGORIES: ToolCategory[] = [
  {
    label: 'Frontend',
    tools: [
      { name: 'React', icon: '⚛️', description: 'UI library' },
      { name: 'Next.js', icon: '▲', description: 'Full-stack framework' },
      { name: 'TypeScript', icon: 'TS', description: 'Type-safe JavaScript' },
      { name: 'Tailwind CSS', icon: '🌊', description: 'Utility-first CSS' },
    ],
  },
  {
    label: 'Backend',
    tools: [
      { name: 'Node.js', icon: '🟢', description: 'JavaScript runtime' },
      { name: 'PostgreSQL', icon: '🐘', description: 'Relational database' },
      { name: 'Redis', icon: '🔴', description: 'In-memory cache' },
      { name: 'Prisma', icon: '◆', description: 'ORM' },
    ],
  },
  {
    label: 'DevOps',
    tools: [
      { name: 'Docker', icon: '🐋', description: 'Containerization' },
      { name: 'AWS', icon: '☁️', description: 'Cloud platform' },
      { name: 'GitHub', icon: '🐙', description: 'Version control' },
      { name: 'Linux', icon: '🐧', description: 'Server OS' },
    ],
  },
]

function FrontendToolboxBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'My Toolbox'
  const description = (rawProps.description as string) || 'Technologies I work with regularly.'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  let categories: ToolCategory[] = DEFAULT_CATEGORIES
  if (typeof rawProps.categories === 'string') {
    try { categories = JSON.parse(rawProps.categories) } catch { /* keep default */ }
  } else if (Array.isArray(rawProps.categories)) {
    categories = rawProps.categories as ToolCategory[]
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-base-content mb-3">{heading}</h2>
          <p className="text-base-content/60 text-lg">{description}</p>
        </div>
        <div className="space-y-10">
          {categories.map((cat, ci) => (
            <div key={ci}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-primary mb-4">{cat.label}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {cat.tools.map((tool, ti) => (
                  <div
                    key={ti}
                    className="group flex flex-col items-center gap-2 p-4 rounded-xl bg-base-100 border border-base-content/10 hover:border-primary/40 hover:shadow-md transition-all cursor-default"
                  >
                    <span className="text-3xl leading-none">{tool.icon}</span>
                    <span className="text-xs font-semibold text-base-content text-center">{tool.name}</span>
                    {tool.description && (
                      <span className="text-[10px] text-base-content/40 text-center hidden group-hover:block">
                        {tool.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const FrontendToolboxBlockDefinition: BlockDefinition = {
  type: 'FrontendToolboxBlock',
  label: 'Tech Toolbox',
  description: 'Portfolio tech stack showcase organized by category with emoji/text icons.',
  category: 'Frontend',
  defaultProps: {
    heading: 'My Toolbox',
    description: 'Technologies I work with regularly.',
    bgColor: '',
    categories: JSON.stringify(DEFAULT_CATEGORIES, null, 2),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    bgColor: { label: 'Background Color', type: 'color' },
    categories: {
      label: 'Categories (JSON)',
      type: 'json',
      placeholder: '[{"label":"Frontend","tools":[{"name":"React","icon":"⚛️","description":"UI library"}]}]',
    },
  },
  Component: FrontendToolboxBlock,
}

export default FrontendToolboxBlock
