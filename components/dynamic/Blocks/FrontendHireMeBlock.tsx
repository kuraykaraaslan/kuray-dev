'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function FrontendHireMeBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Available for Hire'
  const description = (rawProps.description as string) || 'Looking for a dedicated developer for your next project? Let\'s build something amazing together.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'Get In Touch'
  const ctaHref = (rawProps.ctaHref as string) || '/contact'
  const secondaryLabel = rawProps.secondaryLabel as string | undefined
  const secondaryHref = (rawProps.secondaryHref as string) || '/projects'
  const videoSrc = rawProps.videoSrc as string | undefined
  const badge = rawProps.badge as string | undefined
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-6 overflow-hidden" style={{ backgroundColor: bgColor }}>
      {videoSrc && (
        <video
          muted
          loop
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}
      <div className="relative z-10 text-center max-w-3xl">
        {badge && (
          <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6">
            {badge}
          </span>
        )}
        <h2 className="text-5xl md:text-6xl font-bold text-base-content mb-6 leading-tight">
          {heading}
        </h2>
        <p className="text-xl text-base-content/70 mb-10 leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link href={ctaHref} className="btn btn-primary btn-lg">
            {ctaLabel}
          </Link>
          {secondaryLabel && (
            <Link href={secondaryHref} className="btn btn-outline btn-lg">
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

export const FrontendHireMeBlockDefinition: BlockDefinition = {
  type: 'FrontendHireMeBlock',
  label: 'Hire Me CTA',
  description: 'Portfolio hire me hero section with optional background video and CTAs.',
  category: 'Frontend',
  defaultProps: {
    heading: 'Available for Hire',
    description: "Looking for a dedicated developer for your next project? Let's build something amazing together.",
    ctaLabel: 'Get In Touch',
    ctaHref: '/contact',
    secondaryLabel: 'View My Work',
    secondaryHref: '/projects',
    badge: '🟢 Open to Work',
    videoSrc: '',
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    badge: { label: 'Badge Text', type: 'text' },
    ctaLabel: { label: 'Primary CTA Label', type: 'text' },
    ctaHref: { label: 'Primary CTA URL', type: 'url' },
    secondaryLabel: { label: 'Secondary CTA Label', type: 'text' },
    secondaryHref: { label: 'Secondary CTA URL', type: 'url' },
    videoSrc: { label: 'Background Video URL', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: FrontendHireMeBlock,
}

export default FrontendHireMeBlock
