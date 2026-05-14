'use client'

import Image from 'next/image'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface GalleryImage {
  src: string
  alt: string
}

function ImageGalleryBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let images: GalleryImage[] = []
  try {
    const raw = rawProps.images
    images = typeof raw === 'string' ? JSON.parse(raw) : (raw as GalleryImage[]) ?? []
  } catch {
    images = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-16">
              {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
              {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, i) => (
              <div key={i} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <Image src={image.src} alt={image.alt} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const ImageGalleryBlockDefinition: BlockDefinition = {
  type: 'ImageGalleryBlock',
  label: 'Image Gallery',
  category: 'Media',
  description: 'Display a responsive image gallery.',
  defaultProps: {
    heading: 'Gallery',
    subtitle: 'A glimpse into our work and culture',
    images: JSON.stringify([
      { src: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&h=600&fit=crop', alt: 'Office' },
      { src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop', alt: 'Team' },
      { src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop', alt: 'Workspace' },
      { src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop', alt: 'Meeting' },
      { src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop', alt: 'Code' },
      { src: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop', alt: 'Presentation' },
    ]),
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    images: {
      label: 'Images',
      type: 'repeater',
      fields: {
        src: { label: 'Image', type: 'img', uploadFolder: 'gallery', value: '' },
        alt: { label: 'Alt Text', type: 'text', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ImageGalleryBlock as unknown as BlockDefinition['Component'],
}

export default ImageGalleryBlock
