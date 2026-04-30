'use client'

import type { BlockDefinition } from '../types'

// Matches TrustBar: horizontal pipe-separated audience/label list

function TrustBarBlock(rawProps: Record<string, unknown>) {
  const label = rawProps.label as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  let items: string[] = []
  try {
    const raw = rawProps.items
    items = typeof raw === 'string' ? JSON.parse(raw) : (raw as string[]) ?? []
  } catch {
    items = []
  }

  return (
    <section className="py-8 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {label && (
          <p
            className="text-center text-sm mb-6 uppercase tracking-widest"
            style={{ color: 'oklch(var(--bc) / 0.5)' }}
          >
            {label}
          </p>
        )}
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-6 md:gap-10">
              <span
                className="text-sm md:text-base font-medium"
                style={{ color: 'oklch(var(--bc) / 0.7)' }}
              >
                {item}
              </span>
              {i < items.length - 1 && (
                <div
                  className="w-px h-5"
                  style={{ backgroundColor: accent, opacity: 0.4 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const defaultItems = [
  'Large A&E Firms',
  'Asset Owners',
  'Infrastructure Projects',
  'Global Mega-Projects',
  'Developers',
  'Government Entities',
]

export const TrustBarBlockDefinition: BlockDefinition = {
  type: 'TrustBarBlock',
  label: 'Trust Bar',
  category: 'Trust & Social Proof',
  description: 'Horizontal pipe-separated list of audience types or trust signals',
  defaultProps: {
    label: 'Built for Complex AECO Environments',
    items: JSON.stringify(defaultItems),
    bgColor: '',
    accentColor: '',
  },
  schema: {
    label: {
      label: 'Label above items',
      type: 'text',
      value: 'Built for Complex AECO Environments',
      placeholder: 'Built for...',
    },
    items: {
      label: 'Items (JSON string array)',
      type: 'json',
      value: JSON.stringify(defaultItems),
      placeholder: '["Item 1","Item 2","Item 3"]',
    },
    bgColor: { label: 'Background Color', type: 'color', value: '' },
    accentColor: { label: 'Accent Color', type: 'color', value: '' },
  },
  Component: TrustBarBlock,
}

export default TrustBarBlock
