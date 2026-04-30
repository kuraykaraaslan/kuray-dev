'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface ResourceItem {
  title: string
  href: string
  description?: string
}

function DownloadResourcesBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let resources: ResourceItem[] = []
  try {
    const raw = rawProps.resources
    resources = typeof raw === 'string' ? JSON.parse(raw) : (raw as ResourceItem[]) ?? []
  } catch {
    resources = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {resources.map((resource, i) => (
            <Link key={i} href={resource.href} className="rounded-lg p-6 hover:-translate-y-1 transition" style={{ backgroundColor: cardBg }}>
              <h3 className="text-xl text-base-content font-bold mb-2">{resource.title}</h3>
              {resource.description && <p style={{ color: 'oklch(var(--bc) / 0.7)' }}>{resource.description}</p>}
              <div className="mt-4 font-semibold" style={{ color: accent }}>Download / View →</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export const DownloadResourcesBlockDefinition: BlockDefinition = {
  type: 'DownloadResourcesBlock',
  label: 'Download Resources',
  category: 'Content',
  description: 'Promote downloadable resources and documents.',
  defaultProps: {
    heading: 'Resources',
    subtitle: 'Guides, reports, and useful assets',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    resources: JSON.stringify([
      { title: 'Security Whitepaper', href: '/resources/security-whitepaper', description: 'Enterprise security baseline and controls.' },
      { title: 'Platform Overview', href: '/resources/platform-overview', description: 'A concise overview of the product.' },
      { title: 'Implementation Guide', href: '/resources/implementation-guide', description: 'How to roll out successfully.' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    resources: { label: 'Resources (JSON)', type: 'json' },
  },
  Component: DownloadResourcesBlock,
}

export default DownloadResourcesBlock