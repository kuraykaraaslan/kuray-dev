'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Literal column map — dynamic Tailwind class generation is forbidden
const COLS: Record<string, string> = {
  '1': '',
  '2': 'sm:grid-cols-2',
  '3': 'sm:grid-cols-2 lg:grid-cols-3',
}

interface GearItem {
  category?: string
  icon?: string
  name: string
  description?: string
  badge?: string
  href?: string
}

function parseItems(raw: unknown): GearItem[] {
  let list: GearItem[] = []
  try {
    list = typeof raw === 'string' ? JSON.parse(raw) : (raw as GearItem[]) ?? []
  } catch {
    list = []
  }
  return Array.isArray(list) ? list.filter((it) => it && typeof it.name === 'string') : []
}

// Group items by category, preserving first-seen order of both groups and items.
function groupByCategory(items: GearItem[]): Array<{ category: string; items: GearItem[] }> {
  const order: string[] = []
  const map = new Map<string, GearItem[]>()
  for (const item of items) {
    const cat = item.category?.trim() || 'Other'
    if (!map.has(cat)) {
      map.set(cat, [])
      order.push(cat)
    }
    map.get(cat)!.push(item)
  }
  return order.map((category) => ({ category, items: map.get(category)! }))
}

function UsesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const columns = (rawProps.columns as string) || '2'

  const items = parseItems(rawProps.items)
  const groups = groupByCategory(items)
  const gridCols = COLS[columns] ?? COLS['2']

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 md:px-12 lg:px-20">
        {(heading || subtitle) && (
          <div className="mb-16 text-center">
            {heading && (
              <h2 className="mb-4 text-4xl text-base-content md:text-5xl">
                {heading}
                {headingAccent && (
                  <> <span className="text-primary">{headingAccent}</span></>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="mx-auto max-w-3xl text-lg text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className="space-y-14">
          {groups.map((group) => (
            <div key={group.category}>
              <h3 className="mb-6 flex items-center gap-3 text-sm font-semibold uppercase tracking-widest text-base-content/40">
                {group.category}
                <span className="h-px flex-1 bg-base-content/10" />
              </h3>

              <div className={`grid grid-cols-1 ${gridCols} gap-4`}>
                {group.items.map((item, i) => {
                  const inner = (
                    <>
                      {item.icon && (
                        <span className="text-2xl leading-none" aria-hidden>{item.icon}</span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base-content">{item.name}</h4>
                          {item.badge && (
                            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                              {item.badge}
                            </span>
                          )}
                          {item.href && (
                            <span className="text-xs text-base-content/30 transition-colors group-hover:text-primary">↗</span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1 text-sm leading-relaxed text-base-content/60">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </>
                  )

                  const sharedClass =
                    'group flex gap-4 rounded-lg border border-base-content/10 bg-base-200 p-5 transition-all hover:border-primary/40'

                  return item.href ? (
                    <Link
                      key={i}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={sharedClass}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div key={i} className={sharedClass}>
                      {inner}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

const DEFAULT_ITEMS: GearItem[] = [
  { category: 'Editör & Yazılım', icon: '🧑‍💻', name: 'VS Code', description: 'Günlük kod editörüm — Vim eklentisiyle.', badge: 'daily', href: 'https://code.visualstudio.com' },
  { category: 'Editör & Yazılım', icon: '🤖', name: 'Claude Code', description: 'Terminalde AI eşli programlama.' },
  { category: 'Editör & Yazılım', icon: '🐱', name: 'iTerm2 + zsh', description: 'Terminal kurulumum.' },
  { category: 'Donanım', icon: '💻', name: 'MacBook Pro 14"', description: 'M-serisi, 32GB RAM — ana makinem.', badge: 'daily' },
  { category: 'Donanım', icon: '⌨️', name: 'Keychron K2', description: 'Mekanik klavye, kahverengi switch.' },
  { category: 'Donanım', icon: '🖥️', name: 'Dell 27" 4K', description: 'Harici monitör.' },
  { category: 'Masa', icon: '🎧', name: 'Sony WH-1000XM4', description: 'Gürültü engelleyici kulaklık.' },
  { category: 'Masa', icon: '☕', name: 'Çok fazla kahve', description: 'Yakıt.' },
]

export const UsesBlockDefinition: BlockDefinition = {
  type: 'UsesBlock',
  label: 'Uses / Gear',
  category: 'Content',
  description: 'Kullandığın donanım, yazılım ve ekipmanı kategoriye göre listeleyen "Uses" bölümü.',
  defaultProps: {
    heading: 'Kullandığım',
    headingAccent: 'Şeyler',
    subtitle: 'Her gün üzerinde çalıştığım donanım, yazılım ve ekipman.',
    columns: '2',
    items: DEFAULT_ITEMS,
    blockClass: 'bg-base-100',
    sectionId: 'uses',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading (main part)', type: 'text' },
    headingAccent: { label: 'Heading Accent (primary-colored part)', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    columns: { label: 'Columns per group', type: 'select', options: ['1', '2', '3'] },
    items: {
      label: 'Items',
      type: 'repeater',
      fields: {
        category:    { label: 'Category (groups items)', type: 'text',     value: '' },
        icon:        { label: 'Icon (emoji)',            type: 'text',     value: '⭐' },
        name:        { label: 'Name',                    type: 'text',     value: '' },
        description: { label: 'Description',             type: 'textarea', value: '' },
        badge:       { label: 'Badge (optional)',        type: 'text',     value: '' },
        href:        { label: 'Link URL',                type: 'url',      value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: UsesBlock as unknown as BlockDefinition['Component'],
}

export default UsesBlock
