'use client'
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNodes } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import WorldMap from 'react-svg-worldmap'
import type { BlockDefinition } from '../types'

type BgType = 'video' | 'image' | 'svg'

function HireMeBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Hire Me'
  const description = (rawProps.description as string) || 'I am available for freelance projects worldwide.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'View My Services'
  const ctaHref = (rawProps.ctaHref as string) || '#services'
  const bgType = ((rawProps.bgType as string) || 'video') as BgType
  const videoSrc = (rawProps.videoSrc as string) || '/assets/videos/freelance-welcome.mp4'
  const imageSrc = (rawProps.imageSrc as string) || ''
  const svgCode = (rawProps.svgCode as string) || ''

  const [strokeColor, setStrokeColor] = useState('#ffffff')

  useEffect(() => {
    const theme = document.documentElement.getAttribute('data-theme')
    setStrokeColor(theme === 'light' ? '#000000' : '#ffffff')
  }, [])

  return (
    <div className="relative bg-base-200 min-h-screen">
      {bgType === 'video' && (
        <video
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 z-0 object-cover w-full h-screen opacity-25"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {bgType === 'image' && imageSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 z-0 object-cover w-full h-screen opacity-25 pointer-events-none"
        />
      )}

      {bgType === 'svg' && svgCode && (
        <div
          className="absolute inset-0 z-0 w-full h-screen opacity-25 pointer-events-none overflow-hidden"
          dangerouslySetInnerHTML={{ __html: svgCode }}
        />
      )}

      <div
        className="hero min-h-screen select-none"
        style={{ zIndex: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
      >
        <div className="hero-content">
          <div className="flex-1 max-w-2xl">
            <div className="max-w-lg me-4">
              <h2 className="text-5xl font-bold">{heading}</h2>
              <p className="py-6">{description}</p>
              <Link className="btn btn-primary" href={ctaHref}>
                <FontAwesomeIcon icon={faCircleNodes} className="me-2 text-xl w-6 h-6" />
                {ctaLabel}
              </Link>
            </div>
          </div>
          <div className="hidden lg:block max-w-md p-10 bg-primary">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <WorldMap {...({ data: [], size: 300, backgroundColor: 'transparent', strokeColor, color: 'white' } as any)} />
          </div>
        </div>
      </div>
    </div>
  )
}

export const HireMeBlockDefinition: BlockDefinition = {
  type: 'HireMeBlock',
  label: 'Hire Me Hero',
  description: 'Full-screen hero with world map, video/image/SVG background, and freelance CTA.',
  category: 'Hero',
  defaultProps: {
    heading: 'Hire Me',
    description: 'I am available for freelance projects worldwide.',
    ctaLabel: 'View My Services',
    ctaHref: '#services',
    bgType: 'video',
    videoSrc: '/assets/videos/freelance-welcome.mp4',
    imageSrc: '',
    svgCode: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    bgType: { label: 'Background Type', type: 'select', options: ['video', 'image', 'svg'] },
    videoSrc: { label: 'Video URL (.mp4)', type: 'url' },
    imageSrc: { label: 'Image URL', type: 'img', uploadFolder: 'hero' },
    svgCode: { label: 'SVG Code', type: 'textarea', placeholder: '<svg>...</svg>' },
  },
  Component: HireMeBlock as unknown as BlockDefinition['Component'],
}

export default HireMeBlock
