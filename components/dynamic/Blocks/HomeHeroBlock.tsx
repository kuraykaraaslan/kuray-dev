'use client'

import Link from 'next/link'
import Image from 'next/image'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function HomeHeroBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const primaryCtaLabel = rawProps.primaryCtaLabel as string | undefined
  const primaryCtaHref = (rawProps.primaryCtaHref as string) || '/contact'
  const secondaryCtaLabel = rawProps.secondaryCtaLabel as string | undefined
  const secondaryCtaHref = (rawProps.secondaryCtaHref as string) || '/solutions'
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = (rawProps.imageAlt as string) || 'Hero'

  let titleLines: string[] = []
  try {
    const raw = rawProps.titleLines
    const arr: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown[]) ?? []
    titleLines = arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
  } catch {
    titleLines = []
  }

  let bodyLines: string[] = []
  try {
    const raw = rawProps.bodyLines
    const arr: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown[]) ?? []
    bodyLines = arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
  } catch {
    bodyLines = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="min-h-screen flex items-center px-6 md:px-12 lg:px-20 py-20 pt-32">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            {titleLines.length > 0 && (
              <h1 className="text-5xl md:text-6xl lg:text-7xl text-base-content leading-tight">
                {titleLines.map((line, i) =>
                  i === titleLines.length - 1 ? (
                    <span key={i} className="block text-primary">{line}</span>
                  ) : (
                    <span key={i} className="block">{line}</span>
                  )
                )}
              </h1>
            )}

            {bodyLines.map((line, i) => (
              <p key={i} className="text-lg leading-relaxed text-base-content/75">
                {line}
              </p>
            ))}

            {(primaryCtaLabel || secondaryCtaLabel) && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {primaryCtaLabel && (
                  <Link
                    href={primaryCtaHref}
                    className="btn btn-primary px-8 py-4 text-lg"
                  >
                    {primaryCtaLabel}
                  </Link>
                )}
                {secondaryCtaLabel && (
                  <Link
                    href={secondaryCtaHref}
                    className="btn btn-outline px-8 py-4 text-lg"
                  >
                    {secondaryCtaLabel}
                  </Link>
                )}
              </div>
            )}
          </div>

          <div className="relative h-[400px] md:h-[500px]">
            <div className="absolute -inset-4 rounded-lg opacity-20 blur-xl bg-primary" />
            {imageUrl ? (
              <div className="absolute inset-0 rounded-lg overflow-hidden opacity-70">
                <Image
                  src={imageUrl}
                  alt={imageAlt}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-base-100 to-transparent" />
              </div>
            ) : (
              <div className="absolute inset-0 rounded-lg flex items-center justify-center bg-base-200/50 border border-dashed border-base-content/15">
                <span className="text-sm text-base-content/25">Image URL not set</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const HomeHeroBlockDefinition: BlockDefinition = {
  type: 'HomeHeroBlock',
  label: 'Home — Hero (Full Screen)',
  category: 'Hero',
  description: 'Full-screen split hero: stacked multi-line title (last line accented), body text, dual CTAs, image with glow',
  defaultProps: {
    titleLines: [
      { text: 'AI-Driven Transformation' },
      { text: 'for complex' },
      { text: 'AECO' },
      { text: 'Organizations' },
    ],
    bodyLines: [
      { text: 'Your Partner in Smarter, Faster, and More Efficient AECO Projects' },
      { text: 'We help enterprise architecture, engineering, infrastructure, and development teams simplify complexity, eliminate delivery risk, and execute large-scale projects with confidence.' },
    ],
    primaryCtaLabel: 'Talk to an Expert',
    primaryCtaHref: '/contact',
    secondaryCtaLabel: 'Explore Solutions',
    secondaryCtaHref: '/solutions',
    imageUrl:
      'https://images.unsplash.com/photo-1750969185331-e03829f72c7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRpZ2l0YWwlMjBuZXR3b3JrJTIwM2R8ZW58MXx8fHwxNzY5MTQ2Mzk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    imageAlt: 'Digital network visualization',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'home',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    titleLines: {
      label: 'Title Lines (last line gets accent color)',
      type: 'repeater',
      fields: { text: { label: 'Line', type: 'text', value: '' } },
    },
    bodyLines: {
      label: 'Body Lines',
      type: 'repeater',
      fields: { text: { label: 'Paragraph', type: 'textarea', value: '' } },
    },
    primaryCtaLabel: { label: 'Primary Button Label', type: 'text' },
    primaryCtaHref: { label: 'Primary Button URL', type: 'url' },
    secondaryCtaLabel: { label: 'Secondary Button Label', type: 'text' },
    secondaryCtaHref: { label: 'Secondary Button URL', type: 'url' },
    imageUrl: {
      label: 'Image',
      type: 'img',
      uploadFolder: 'content',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: HomeHeroBlock as unknown as BlockDefinition['Component'],
}

export default HomeHeroBlock
