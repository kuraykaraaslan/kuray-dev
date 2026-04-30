'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import type { BlockDefinition } from '../types'

const HeatMap = dynamic(
  () => import('@/components/frontend/Features/Hero/GitContributions/Partial/HeatMap'),
  { ssr: false }
)

function FrontendGitContributionsBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'GitHub Contributions'
  const description = (rawProps.description as string) || 'My open-source activity over the past year.'
  const githubUrl = (rawProps.githubUrl as string) || 'https://github.com/'
  const ctaLabel = (rawProps.ctaLabel as string) || 'View GitHub Profile'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b1))'

  return (
    <section className="py-20 px-6 hidden lg:block" style={{ backgroundColor: bgColor }}>
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-5xl font-bold text-base-content mb-4">{heading}</h2>
        <p className="text-base-content/60 text-lg mb-10">{description}</p>
        <HeatMap />
        <div className="flex justify-center mt-10">
          <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

export const FrontendGitContributionsBlockDefinition: BlockDefinition = {
  type: 'FrontendGitContributionsBlock',
  label: 'GitHub Contributions',
  description: 'GitHub contribution heatmap fetched from the site API.',
  category: 'Frontend',
  defaultProps: {
    heading: 'GitHub Contributions',
    description: 'My open-source activity over the past year.',
    githubUrl: 'https://github.com/',
    ctaLabel: 'View GitHub Profile',
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    githubUrl: { label: 'GitHub Profile URL', type: 'url' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: FrontendGitContributionsBlock,
}

export default FrontendGitContributionsBlock
