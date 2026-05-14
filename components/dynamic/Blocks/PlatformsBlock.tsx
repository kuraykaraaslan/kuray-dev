'use client'
import Image from 'next/image'
import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../BaseBlock'
import type { BlockDefinition } from '../types'

interface Platform {
  name: string
  icon: string
  url: string
  bgColor?: string
}

const DEFAULT_PLATFORMS: Platform[] = [
  { name: 'Fiverr',  icon: '/assets/svg/fiverr.svg',  url: 'https://www.fiverr.com/kuraykaraaslan',                  bgColor: 'bg-white' },
  { name: 'Upwork',  icon: '/assets/svg/upwork.svg',  url: 'https://www.upwork.com/freelancers/~01694c65c4ad50b809', bgColor: 'bg-white' },
  { name: 'Bionluk', icon: '/assets/svg/bionluk.svg', url: 'https://bionluk.com/uye/kuraykaraaslan',                 bgColor: 'bg-white' },
  { name: 'Armut',   icon: '/assets/img/armut.png',   url: 'https://armut.com',                                      bgColor: 'bg-white' },
]

// Literal class maps so Tailwind JIT includes every value in the bundle
const MOBILE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}
const DESKTOP_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(val)))
}

function parsePlatforms(raw: unknown): Platform[] {
  if (Array.isArray(raw)) return raw as Platform[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_PLATFORMS
}

function PlatformsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const title    = (rawProps.title    as string) || 'Find Me On'
  const subtitle = (rawProps.subtitle as string) || 'Freelance Platforms'
  const mobileColumns  = clamp(Number(rawProps.mobileColumns)  || 2, 1, 6)
  const desktopColumns = clamp(Number(rawProps.desktopColumns) || 6, 1, 6)
  const platforms = parsePlatforms(rawProps.platforms)

  if (!platforms.length) return null

  const gridCls = `grid gap-6 ${MOBILE_COLS[mobileColumns]} ${DESKTOP_COLS[desktopColumns]}`

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <span className="font-medium mb-4 block">{subtitle}</span>
          <h2 className="text-4xl font-bold">{title}</h2>
        </div>
        <div className={gridCls}>
          {platforms.map((p, i) => (
            <Link
              key={i}
              href={p.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center p-6 rounded-xl shadow border border-gray-200 hover:scale-105 transition-transform ${p.bgColor || 'bg-white'}`}
            >
              {p.icon ? (
                <Image
                  src={p.icon}
                  alt={p.name || `Platform ${i + 1}`}
                  width={120}
                  height={48}
                  className="object-contain h-12 w-auto"
                />
              ) : (
                <span className="font-semibold text-sm text-center">{p.name}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const PlatformsBlockDefinition: BlockDefinition = {
  type: 'PlatformsBlock',
  label: 'Platforms',
  description: 'Unlimited freelance / work platform logos — add, remove, and reorder freely.',
  category: 'Hero',
  defaultProps: {
    title: 'Find Me On',
    subtitle: 'Freelance Platforms',
    mobileColumns: 2,
    desktopColumns: 6,
    platforms: DEFAULT_PLATFORMS,
    blockClass: 'py-12 bg-base-200',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title:          { label: 'Section Title',    type: 'text' },
    subtitle:       { label: 'Subtitle',         type: 'text' },
    mobileColumns:  { label: 'Mobil — Sütun Sayısı (1–6)',  type: 'number' },
    desktopColumns: { label: 'Desktop — Sütun Sayısı (1–6)', type: 'number' },
    platforms: {
      label: 'Platforms',
      type: 'repeater',
      fields: {
        name:    { label: 'Name',             type: 'text', placeholder: 'Fiverr' },
        icon:    { label: 'Logo',             type: 'img',  uploadFolder: 'platforms' },
        url:     { label: 'URL',              type: 'url' },
        bgColor: { label: 'Background Class', type: 'text', placeholder: 'bg-white', value: 'bg-white' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: PlatformsBlock as unknown as BlockDefinition['Component'],
}

export default PlatformsBlock
