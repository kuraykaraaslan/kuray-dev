'use client'

import { useState } from 'react'
import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Inline fallback image component
const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg=='

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [didError, setDidError] = useState(false)
  if (didError) {
    return (
      <div className={`inline-block bg-base-300 text-center align-middle ${className ?? ''}`}>
        <div className="flex items-center justify-center w-full h-full">
          <img src={ERROR_IMG_SRC} alt="Error loading image" />
        </div>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setDidError(true)}
    />
  )
}

function AboutHeroBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)

  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '/contact'
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = (rawProps.imageAlt as string) || 'About'

  let headlineLines: string[] = []
  try {
    const raw = rawProps.headlineLines
    const arr: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown[]) ?? []
    headlineLines = arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
  } catch {
    headlineLines = []
  }

  let paragraphList: string[] = []
  try {
    const raw = rawProps.paragraphs
    const arr: unknown[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as unknown[]) ?? []
    paragraphList = arr.map(i => typeof i === 'string' ? i : (i as { text: string }).text ?? '').filter(Boolean)
  } catch {
    paragraphList = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {headlineLines.length > 0 && (
                <h1 className="text-5xl md:text-6xl text-base-content mb-6 leading-tight">
                  {headlineLines.map((line, i) =>
                    i === headlineLines.length - 1 ? (
                      <span key={i} className="text-primary">{line}</span>
                    ) : (
                      <span key={i}>{line}<br /></span>
                    )
                  )}
                </h1>
              )}
              {paragraphList.map((p, i) => (
                <p key={i} className="text-xl leading-relaxed mb-4 text-base-content/80">
                  {p}
                </p>
              ))}
              {ctaLabel && (
                <Link
                  href={ctaHref}
                  className="btn btn-primary inline-block mt-2 px-8 py-4 text-lg font-medium hover:scale-105 transition-transform"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
            {imageUrl ? (
              <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={imageUrl}
                  alt={imageAlt}
                  className="w-full h-full object-cover opacity-70"
                />
                <div className="absolute inset-0 border-2 rounded-lg border-primary opacity-20" />
              </div>
            ) : (
              <div className="h-[400px] md:h-[500px] rounded-lg flex items-center justify-center bg-base-200 border border-dashed border-base-content/15">
                <span className="text-sm text-base-content/25">Image URL not set</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const AboutHeroBlockDefinition: BlockDefinition = {
  type: 'AboutHeroBlock',
  label: 'About — Hero',
  category: 'Hero',
  description: 'Multi-line headline hero for the About page: last line accented, paragraphs array, split image with accent border.',
  defaultProps: {
    headlineLines: [
      { text: 'Expert-Led.' },
      { text: 'Outcome-Driven.' },
      { text: 'Human-Centric.' },
    ],
    paragraphs: [
      { text: "We don't just create. We inspire." },
      { text: "We don't just finish projects. We create remarkable experiences." },
      { text: "We don't just construct. We elevate." },
      { text: "Founded in 2019, we exist to help professionals do more with less stress. By blending advanced technologies with expert consulting, we empower teams to overcome inefficiencies, optimize collaboration, and deliver exceptional results." },
    ],
    ctaLabel: '',
    ctaHref: '/contact',
    imageUrl:
      'https://images.unsplash.com/photo-1762341120156-4a8303067873?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc2OTEyNzg3NXww&ixlib=rb-4.1.0&q=80&w=1080',
    imageAlt: 'Modern office technology',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    headlineLines: {
      label: 'Headline Lines',
      type: 'repeater',
      fields: { text: { label: 'Line', type: 'text', value: '' } },
    },
    paragraphs: {
      label: 'Paragraphs',
      type: 'repeater',
      fields: { text: { label: 'Paragraph', type: 'textarea', value: '' } },
    },
    ctaLabel: { label: 'CTA Button Label', type: 'text', placeholder: 'Learn More' },
    ctaHref: { label: 'CTA Button URL', type: 'url', placeholder: '/contact' },
    imageUrl: {
      label: 'Image',
      type: 'img',
      uploadFolder: 'content',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: AboutHeroBlock,
}

export default AboutHeroBlock
