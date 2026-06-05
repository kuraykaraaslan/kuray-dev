'use client'

import Image from 'next/image'
import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function TextImageBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const headingAccent = rawProps.headingAccent as string | undefined
  const text = rawProps.text as string | undefined
  const imageUrl = rawProps.imageUrl as string | undefined
  const imageAlt = rawProps.imageAlt as string | undefined
  const imagePosition = (rawProps.imagePosition as string) || 'right'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = rawProps.ctaHref as string | undefined

  const isImageLeft = imagePosition === 'left'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className={isImageLeft ? 'md:order-2' : 'md:order-1'}>
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-6 leading-tight">
                {heading}
                {headingAccent && (
                  <>
                    <br />
                    <span className="text-primary">{headingAccent}</span>
                  </>
                )}
              </h2>
            )}

            {text && (
              <p className="text-lg leading-relaxed mb-8 text-base-content/70">
                {text}
              </p>
            )}

            {ctaLabel && ctaHref && (
              <Link
                href={ctaHref}
                className="btn btn-primary"
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
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const TextImageBlockDefinition: BlockDefinition = {
  type: 'TextImageBlock',
  label: 'Text + Image',
  category: 'Content',
  description: 'Text content alongside an image with optional CTA button (alternating layout).',
  defaultProps: {
    heading: 'Powerful Features',
    headingAccent: 'Simplified',
    text: 'Our platform combines powerful features with an intuitive interface, making it easy for your team to get started.',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
    imageAlt: 'Feature showcase',
    imagePosition: 'right',
    ctaLabel: 'Learn More',
    ctaHref: '/features',
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    headingAccent: { label: 'Heading Accent (coloured second line)', type: 'text' },
    text: { label: 'Text', type: 'textarea' },
    imageUrl: {
      label: 'Image',
      type: 'img',
      uploadFolder: 'content',
      accept: 'image/jpeg,image/png,image/webp,image/avif',
    },
    imageAlt: { label: 'Image Alt Text', type: 'text' },
    imagePosition: {
      label: 'Image Position',
      type: 'select',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ],
    },
    ctaLabel: { label: 'CTA Button Label', type: 'text' },
    ctaHref: { label: 'CTA Button URL', type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TextImageBlock as unknown as BlockDefinition['Component'],
}

export default TextImageBlock
