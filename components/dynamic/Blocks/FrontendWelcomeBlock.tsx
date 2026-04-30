'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

function FrontendWelcomeBlock(rawProps: Record<string, unknown>) {
  const greeting = (rawProps.greeting as string) || 'Hi, I am'
  const name = (rawProps.name as string) || 'Your Name'
  const title = (rawProps.title as string) || 'Full-Stack Developer'
  const description = (rawProps.description as string) || 'I build modern web applications.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'Contact Me'
  const ctaHref = (rawProps.ctaHref as string) || '#contact'
  const secondaryLabel = rawProps.secondaryLabel as string | undefined
  const secondaryHref = (rawProps.secondaryHref as string) || '#portfolio'
  const avatarUrl = rawProps.avatarUrl as string | undefined
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  return (
    <section
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: bgColor }}
    >
      <div className="hero-content flex flex-col md:flex-row-reverse gap-12 max-w-5xl w-full">
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={name}
            className="w-48 h-48 md:w-64 md:h-64 rounded-full object-cover shadow-xl ring-4 ring-primary/20 flex-shrink-0"
          />
        )}
        <div className={avatarUrl ? '' : 'text-center w-full'}>
          <p className="text-sm font-medium text-primary mb-2 uppercase tracking-widest">{greeting}</p>
          <h1 className="text-5xl md:text-6xl font-bold text-base-content leading-tight mb-2">
            {name}
          </h1>
          <p className="text-2xl font-medium text-primary mb-4">{title}</p>
          <p className="text-lg text-base-content/70 mb-8 max-w-xl leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={ctaHref} className="btn btn-primary">
              {ctaLabel}
            </Link>
            {secondaryLabel && (
              <Link href={secondaryHref} className="btn btn-outline">
                {secondaryLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export const FrontendWelcomeBlockDefinition: BlockDefinition = {
  type: 'FrontendWelcomeBlock',
  label: 'Welcome Hero',
  description: 'Personalized portfolio welcome section with avatar, name, title, and CTAs.',
  category: 'Frontend',
  defaultProps: {
    greeting: 'Hi, I am',
    name: 'Kuray Karaaslan',
    title: 'Full-Stack Developer',
    description: 'I design and build modern, scalable web applications. Available for freelance projects worldwide.',
    ctaLabel: 'Contact Me',
    ctaHref: '#contact',
    secondaryLabel: 'View Projects',
    secondaryHref: '#projects',
    avatarUrl: '',
    bgColor: '',
  },
  schema: {
    greeting: { label: 'Greeting line', type: 'text' },
    name: { label: 'Your Name', type: 'text' },
    title: { label: 'Professional Title', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    ctaLabel: { label: 'Primary CTA Label', type: 'text' },
    ctaHref: { label: 'Primary CTA URL', type: 'url' },
    secondaryLabel: { label: 'Secondary CTA Label', type: 'text' },
    secondaryHref: { label: 'Secondary CTA URL', type: 'url' },
    avatarUrl: { label: 'Avatar Image', type: 'img', uploadFolder: 'profile' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: FrontendWelcomeBlock,
}

export default FrontendWelcomeBlock
