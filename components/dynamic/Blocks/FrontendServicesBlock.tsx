'use client'

import type { BlockDefinition } from '../types'

interface ServiceItem {
  title: string
  description: string
  image?: string
  tags?: string[]
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { title: 'Mobile Development', description: 'Cross-platform iOS and Android apps built with React Native.', image: '', tags: ['Android', 'iOS', 'React Native'] },
  { title: 'Web Development', description: 'Modern, responsive web applications with the latest technologies.', image: '', tags: ['React', 'Next.js', 'TypeScript'] },
  { title: 'Backend & API', description: 'Scalable backend systems, REST APIs, and cloud infrastructure.', image: '', tags: ['Node.js', 'PostgreSQL', 'AWS'] },
  { title: 'Other Services', description: 'Consulting, code review, and technical architecture advice.', image: '', tags: [] },
]

function FrontendServicesBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'What I Do'
  const subtitle = (rawProps.subtitle as string) || 'Services I offer'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  let items: ServiceItem[] = DEFAULT_SERVICES
  if (typeof rawProps.items === 'string') {
    try { items = JSON.parse(rawProps.items) } catch { /* keep default */ }
  } else if (Array.isArray(rawProps.items)) {
    items = rawProps.items as ServiceItem[]
  }

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">{subtitle}</p>
          <h2 className="text-4xl font-bold text-base-content">{heading}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((service, i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-base-100 shadow-sm border border-base-content/10">
              {service.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={service.image} alt={service.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-base-content mb-2">{service.title}</h3>
                <p className="text-base-content/60 mb-4 leading-relaxed">{service.description}</p>
                {service.tags && service.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {tag}
                      </span>
                    ))}
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

export const FrontendServicesBlockDefinition: BlockDefinition = {
  type: 'FrontendServicesBlock',
  label: 'Services Showcase',
  description: 'Portfolio services grid with image, title, description, and tech tags.',
  category: 'Frontend',
  defaultProps: {
    heading: 'What I Do',
    subtitle: 'Services',
    bgColor: '',
    items: JSON.stringify(DEFAULT_SERVICES, null, 2),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    items: {
      label: 'Services (JSON)',
      type: 'json',
      placeholder: '[{"title":"...","description":"...","image":"...","tags":["..."]}]',
    },
  },
  Component: FrontendServicesBlock,
}

export default FrontendServicesBlock
