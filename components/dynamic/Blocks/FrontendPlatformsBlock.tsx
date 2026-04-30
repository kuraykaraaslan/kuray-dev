'use client'

import type { BlockDefinition } from '../types'

interface PlatformItem {
  name: string
  icon: string
  url: string
  description?: string
}

const DEFAULT_PLATFORMS: PlatformItem[] = [
  { name: 'Fiverr', icon: '/assets/svg/fiverr.svg', url: 'https://www.fiverr.com/', description: 'Top Rated Seller' },
  { name: 'Upwork', icon: '/assets/svg/upwork.svg', url: 'https://www.upwork.com/', description: 'Top Rated Plus' },
  { name: 'Bionluk', icon: '/assets/svg/bionluk.svg', url: 'https://bionluk.com/', description: 'Level 2 Seller' },
  { name: 'Armut', icon: '/assets/img/armut.png', url: 'https://armut.com/', description: 'Pro Seller' },
]

function FrontendPlatformsBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Find Me On'
  const subtitle = (rawProps.subtitle as string) || 'Freelance Platforms'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  let items: PlatformItem[] = DEFAULT_PLATFORMS
  if (typeof rawProps.items === 'string') {
    try { items = JSON.parse(rawProps.items) } catch { /* keep default */ }
  } else if (Array.isArray(rawProps.items)) {
    items = rawProps.items as PlatformItem[]
  }

  return (
    <section className="py-16 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">{subtitle}</p>
          <h2 className="text-4xl font-bold text-base-content">{heading}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {items.map((platform, i) => (
            <a
              key={i}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white border border-base-content/10 hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={platform.icon}
                alt={platform.name}
                className="h-12 w-auto object-contain"
              />
              <div className="text-center">
                <p className="font-semibold text-base-content/80 text-sm">{platform.name}</p>
                {platform.description && (
                  <p className="text-xs text-base-content/40 mt-0.5">{platform.description}</p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export const FrontendPlatformsBlockDefinition: BlockDefinition = {
  type: 'FrontendPlatformsBlock',
  label: 'Freelance Platforms',
  description: 'Freelance platform logos grid with links (Fiverr, Upwork, etc.).',
  category: 'Frontend',
  defaultProps: {
    heading: 'Find Me On',
    subtitle: 'Freelance Platforms',
    bgColor: '',
    items: JSON.stringify(DEFAULT_PLATFORMS, null, 2),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    items: {
      label: 'Platforms (JSON)',
      type: 'json',
      placeholder: '[{"name":"...","icon":"/path/to/icon.svg","url":"https://...","description":"..."}]',
    },
  },
  Component: FrontendPlatformsBlock,
}

export default FrontendPlatformsBlock
