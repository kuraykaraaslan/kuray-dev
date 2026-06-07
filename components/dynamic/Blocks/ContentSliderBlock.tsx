'use client'

import { useState, useEffect, useCallback } from 'react'
import ContentSlide from './ContentSlide'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Slide {
  image?: string
  title?: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400&h=600&fit=crop',
    title: 'Build Something Great',
    subtitle: 'Your journey starts here',
    description: 'We help you turn ideas into reality with the right tools and the right team.',
    ctaLabel: 'Get Started',
    ctaHref: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1400&h=600&fit=crop',
    title: 'Work with the Best',
    subtitle: 'A team you can trust',
    description: 'Our experts bring years of experience across design, engineering, and strategy.',
    ctaLabel: 'Meet the Team',
    ctaHref: '#',
  },
  {
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&h=600&fit=crop',
    title: 'Scale Without Limits',
    subtitle: 'Built for growth',
    description: 'From MVP to millions of users, our platform grows with you every step of the way.',
    ctaLabel: 'Learn More',
    ctaHref: '#',
  },
]

function parseSlides(raw: unknown): Slide[] {
  if (Array.isArray(raw)) return raw as Slide[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_SLIDES
}

function ContentSliderBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const slides = parseSlides(rawProps.slides)
  const autoPlay = (rawProps.autoPlay as boolean) ?? false
  const interval = (rawProps.interval as number) || 5000
  const showArrows = (rawProps.showArrows as boolean) ?? true
  const showDots = (rawProps.showDots as boolean) ?? true

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
      <div className="relative overflow-hidden" style={{ minHeight: 480 }}>
        {/* Slides strip */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((s, i) => (
            <ContentSlide key={i} {...s} index={i} />
          ))}
        </div>

        {/* Arrows */}
        {showArrows && total > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white text-xl transition-colors"
            >
              ‹
            </button>
            <button
              onClick={next}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/65 flex items-center justify-center text-white text-xl transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* Dots */}
        {showDots && total > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
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

export const ContentSliderBlockDefinition: BlockDefinition = {
  type: 'ContentSliderBlock',
  label: 'Content Slider',
  category: 'Media',
  description: 'Full-width hero slider — each slide has a background image, title, subtitle, description, and CTA button.',
  icon: '🎠',
  defaultProps: {
    slides: DEFAULT_SLIDES,
    autoPlay: false,
    interval: 5000,
    showArrows: true,
    showDots: true,
    blockClass: '',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    slides: {
      label: 'Slides',
      type: 'repeater',
      fields: {
        image: { label: 'Background Image', type: 'img', uploadFolder: 'images', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        subtitle: { label: 'Subtitle / Tagline', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
        ctaLabel: { label: 'Button Label', type: 'text', value: '' },
        ctaHref: { label: 'Button Link', type: 'url', value: '' },
      },
    },
    showArrows: { label: 'Show Arrows', type: 'boolean', placeholder: 'Show prev / next buttons' },
    showDots: { label: 'Show Dots', type: 'boolean', placeholder: 'Show dot indicators' },
    autoPlay: { label: 'Auto-play', type: 'boolean', placeholder: 'Automatically advance slides' },
    interval: {
      label: 'Interval (ms)',
      type: 'number',
      min: 1000,
      max: 15000,
      step: 500,
      showIf: { autoPlay: [true] },
      description: 'Time between slides in milliseconds.',
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ContentSliderBlock as unknown as BlockDefinition['Component'],
}

export default ContentSliderBlock
