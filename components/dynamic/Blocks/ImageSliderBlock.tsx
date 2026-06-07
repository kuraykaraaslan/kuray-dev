'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Slide {
  image: string
  alt: string
  caption?: string
  link?: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=600&fit=crop',
    alt: 'Office',
    caption: 'Our workspace',
  },
  {
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=600&fit=crop',
    alt: 'Team',
    caption: 'Great team',
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    alt: 'Workshop',
    caption: 'In action',
  },
]

function parseSlides(raw: unknown): Slide[] {
  if (Array.isArray(raw)) return raw as Slide[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_SLIDES
}

function ImageSliderBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const slides = parseSlides(rawProps.slides)
  const autoPlay = (rawProps.autoPlay as boolean) ?? false
  const interval = (rawProps.interval as number) || 4000
  const showArrows = (rawProps.showArrows as boolean) ?? true
  const showDots = (rawProps.showDots as boolean) ?? true
  const slideHeight = (rawProps.slideHeight as number) || 500

  const [current, setCurrent] = useState(0)
  const total = slides.length

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])

  useEffect(() => {
    if (!autoPlay || total < 2) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [autoPlay, interval, next, total])

  if (total === 0) return null

  return (
    <BaseBlock {...baseProps}>
      <div className="relative overflow-hidden" style={{ height: slideHeight }}>
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, i) => {
            const inner = (
              <>
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.alt || `Slide ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                ) : (
                  <div className="w-full h-full bg-base-300 flex items-center justify-center text-base-content/30 text-sm">
                    No image
                  </div>
                )}
                {slide.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-6 py-3">
                    <p className="text-white text-sm">{slide.caption}</p>
                  </div>
                )}
              </>
            )
            return slide.link ? (
              <a
                key={i}
                href={slide.link}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-full h-full flex-shrink-0 block"
              >
                {inner}
              </a>
            ) : (
              <div key={i} className="relative w-full h-full flex-shrink-0">
                {inner}
              </div>
            )
          })}
        </div>

        {showArrows && total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              ›
            </button>
          </>
        )}

        {showDots && total > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </BaseBlock>
  )
}

export const ImageSliderBlockDefinition: BlockDefinition = {
  type: 'ImageSliderBlock',
  label: 'Image Slider',
  category: 'Media',
  description: 'A responsive image carousel with optional autoplay, arrows, and dots.',
  icon: '🖼️',
  defaultProps: {
    slides: DEFAULT_SLIDES,
    slideHeight: 500,
    autoPlay: false,
    interval: 4000,
    showArrows: true,
    showDots: true,
    blockClass: 'bg-base-100',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    slides: {
      label: 'Slides',
      type: 'repeater',
      fields: {
        image: { label: 'Image', type: 'img', uploadFolder: 'images', value: '' },
        alt: { label: 'Alt Text', type: 'text', value: '' },
        caption: { label: 'Caption', type: 'text', value: '' },
        link: { label: 'Link URL', type: 'url', value: '', placeholder: 'https://…' },
      },
    },
    slideHeight: {
      label: 'Slide Height (px)',
      type: 'number',
      min: 200,
      max: 1200,
      step: 50,
    },
    autoPlay: { label: 'Auto-play', type: 'boolean', placeholder: 'Automatically advance slides' },
    interval: {
      label: 'Interval (ms)',
      type: 'number',
      min: 1000,
      max: 10000,
      step: 500,
      showIf: { autoPlay: [true] },
      description: 'Time between slides in milliseconds.',
    },
    showArrows: { label: 'Show Arrows', type: 'boolean', placeholder: 'Show prev / next buttons' },
    showDots: { label: 'Show Dots', type: 'boolean', placeholder: 'Show dot indicators' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ImageSliderBlock as unknown as BlockDefinition['Component'],
}

export default ImageSliderBlock
