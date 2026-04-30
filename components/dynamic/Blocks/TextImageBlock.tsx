'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { BlockDefinition } from '../types'

function TextImageBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const text = rawProps.text as string | undefined
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = rawProps.imageAlt as string | undefined
  const imagePosition = (rawProps.imagePosition as string) || 'right'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  const isImageLeft = imagePosition === 'left'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${isImageLeft ? 'md:flex-row-reverse' : ''}`}>
          {/* Text Content */}
          <div className={isImageLeft ? 'md:order-2' : 'md:order-1'}>
            {heading && (
              <h2 className="text-4xl md:text-5xl text-white mb-6 leading-tight">
                {heading}
                {headingAccent && (
                  <>
                    <br />
                    <span style={{ color: accent }}>{headingAccent}</span>
                  </>
                )}
              </h2>
            )}

            {text && (
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {text}
              </p>
            )}

            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="inline-block px-8 py-3 rounded-md font-medium transition-transform hover:scale-105"
                style={{ backgroundColor: accent, color: bg }}
              >
                {ctaLabel}
              </Link>
            )}
          </div>

          {/* Image */}
          {imageUrl && (
            <div className={isImageLeft ? 'md:order-1' : 'md:order-2'}>
              <div className="relative w-full h-96 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={imageAlt || 'Feature image'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export const TextImageBlockDefinition: BlockDefinition = {
  type: 'TextImageBlock',
  label: 'Text + Image',
  category: 'Content',
  description: 'Text content with image (alternating layout).',
  defaultProps: {
    heading: 'Powerful Features',
    headingAccent: 'Simplified',
    text: 'Our platform combines powerful features with an intuitive interface, making it easy for your team to get started.',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
    imageAlt: 'Feature showcase',
    imagePosition: 'right',
    ctaLabel: 'Learn More',
    ctaHref: '/features',
    bgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    headingAccent: { label: 'Heading Accent', type: 'text' },
    text: { label: 'Text', type: 'textarea' },
    imageUrl: { label: 'Image', type: 'img', uploadFolder: 'content', accept: 'image/jpeg,image/png,image/webp,image/avif' },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    imagePosition: { label: 'Image Position', type: 'select', options: ['left', 'right'] },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref: { label: 'CTA Link', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: TextImageBlock,
}

export default TextImageBlock
