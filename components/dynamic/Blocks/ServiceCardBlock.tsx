'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface ServiceCard {
  icon?: string
  title: string
  description: string
  href?: string
}

function ServiceCardBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  //const accent = (rawProps.accentColor as string) || '#ffc418'

  let services: ServiceCard[] = []
  try {
    const raw = rawProps.services
    services = typeof raw === 'string' ? JSON.parse(raw) : (raw as ServiceCard[]) ?? []
  } catch {
    services = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => {
            const content = (
              <div className="rounded-lg p-8 hover:-translate-y-1 transition" style={{ backgroundColor: cardBg }}>
                {service.icon && <div className="text-4xl mb-4">{service.icon}</div>}
                <h3 className="text-2xl text-white font-bold mb-3">{service.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{service.description}</p>
              </div>
            )

            return service.href ? (
              <Link key={i} href={service.href}>{content}</Link>
            ) : (
              <div key={i}>{content}</div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const ServiceCardBlockDefinition: BlockDefinition = {
  type: 'ServiceCardBlock',
  label: 'Service Cards',
  category: 'Features',
  description: 'Show services or solutions as cards.',
  defaultProps: {
    heading: 'Our Services',
    subtitle: 'Everything your enterprise needs in one place',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    services: JSON.stringify([
      { icon: '⚙️', title: 'Automation', description: 'Reduce manual work with workflow automation.', href: '/services/automation' },
      { icon: '🔐', title: 'Security', description: 'Protect your data and users with enterprise controls.', href: '/services/security' },
      { icon: '📈', title: 'Analytics', description: 'Measure performance with actionable dashboards.', href: '/services/analytics' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    services: { label: 'Services (JSON)', type: 'json' },
  },
  Component: ServiceCardBlock,
}

export default ServiceCardBlock