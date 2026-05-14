'use client'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../BaseBlock'
import SingleService from '@/components/frontend/Features/Hero/Services/Partials/SingleService'
import type { Service } from '@/types/content/ProjectTypes'
import type { BlockDefinition } from '../types'

// Literal maps — Tailwind JIT needs to see the full class strings in source
const MOBILE_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}
const DESKTOP_COLS: Record<number, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(val)))
}

interface ServiceItem {
  title: string
  description: string
  image: string
  link?: string
  bgColor?: string
  borderColor?: string
  textColor?: string
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { title: 'Mobile Development', description: 'Native and cross-platform mobile apps for iOS and Android.', image: '/assets/img/services/phone.jpg' },
  { title: 'Web Development',    description: 'Modern, responsive web applications and landing pages.',     image: '/assets/img/services/web.jpg' },
  { title: 'Backend Development',description: 'Scalable APIs, databases, and server infrastructure.',       image: '/assets/img/services/admin.jpg' },
  { title: 'Other Services',     description: 'UI/UX design, consulting, and more.',                       image: '/assets/img/services/other2.jpg' },
]

function parseServices(raw: unknown): ServiceItem[] {
  if (Array.isArray(raw)) return raw as ServiceItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_SERVICES
}

function ServicesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const sectionTitle       = (rawProps.sectionTitle as string)       || 'What I Do'
  const sectionDescription = (rawProps.sectionDescription as string) || 'A range of services I offer.'
  const mobileColumns      = clamp(Number(rawProps.mobileColumns)  || 1, 1, 4)
  const desktopColumns     = clamp(Number(rawProps.desktopColumns) || 2, 1, 4)

  const items = parseServices(rawProps.services)

  const services: Service[] = items.map((item, i) => ({
    id: String(i + 1),
    image:       item.image       || '',
    title:       item.title       || '',
    description: item.description || '',
    tags:        [],
    urls:        item.link ? [{ url: item.link, type: 'Demo' as const }] : [],
    bgColor:     item.bgColor,
    borderColor: item.borderColor,
    textColor:   item.textColor,
  }))

  const gridCls = `grid gap-8 ${MOBILE_COLS[mobileColumns]} ${DESKTOP_COLS[desktopColumns]}`

  return (
    <BaseBlock {...baseProps} className="bg-base-100 pt-16">
      <div className="relative z-10 px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center lg:mb-16 mb-8">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold">{sectionTitle}</h2>
          <p className="font-light sm:text-xl">{sectionDescription}</p>
        </div>
        <div className={gridCls}>
          {services.map((service) => (
            <SingleService key={service.id} service={service} />
          ))}
        </div>
      </div>
    </BaseBlock>
  )
}

export const ServicesBlockDefinition: BlockDefinition = {
  type: 'ServicesBlock',
  label: 'Services',
  description: 'Configurable service card grid — add, remove, and reorder freely.',
  category: 'Hero',
  defaultProps: {
    sectionTitle: 'What I Do',
    sectionDescription: 'A range of services I offer to bring your ideas to life.',
    mobileColumns: 1,
    desktopColumns: 2,
    services: DEFAULT_SERVICES,
    sectionId: 'services',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    sectionTitle:       { label: 'Section Title',       type: 'text' },
    sectionDescription: { label: 'Section Description', type: 'textarea' },
    mobileColumns:      { label: 'Mobil — Sütun Sayısı (1–4)',   type: 'number' },
    desktopColumns:     { label: 'Desktop — Sütun Sayısı (1–4)',  type: 'number' },
    services: {
      label: 'Services',
      type: 'repeater',
      fields: {
        title:       { label: 'Title',            type: 'text' },
        description: { label: 'Description',      type: 'textarea' },
        image:       { label: 'Image',            type: 'img',  uploadFolder: 'services' },
        link:        { label: 'Link (optional)',  type: 'url' },
        bgColor:     { label: 'BG Class',         type: 'text', placeholder: 'bg-base-200' },
        borderColor: { label: 'Border Class',     type: 'text', placeholder: 'border-base-300' },
        textColor:   { label: 'Text Class',       type: 'text', placeholder: 'text-base-900' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ServicesBlock as unknown as BlockDefinition['Component'],
}

export default ServicesBlock
