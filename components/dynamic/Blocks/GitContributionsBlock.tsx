'use client'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import dynamic from 'next/dynamic'
import type { BlockDefinition } from '../types'

const HeatMap = dynamic(
  () => import('@/components/frontend/Features/Hero/GitContributions/Partial/HeatMap'),
  { ssr: false }
)

function GitContributionsBlock(rawProps: Record<string, unknown>) {
  const title = (rawProps.title as string) || 'Git Contributions'
  const description = (rawProps.description as string) || 'My open source activity on GitHub.'
  const githubUrl = (rawProps.githubUrl as string) || 'https://github.com/kuraykaraaslan'
  const buttonLabel = (rawProps.buttonLabel as string) || 'View on GitHub'

  return (
    <div className="hero min-h-screen bg-base-100 hidden lg:flex items-center justify-center">
      <div className="hero-content text-center">
        <div>
          <h2 className="text-5xl font-bold">{title}</h2>
          <p className="py-6">{description}</p>
          <HeatMap />
          <div className="flex justify-center py-6">
            <Link
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <FontAwesomeIcon icon={faGithub} className="me-2 text-xl" height="20" width="20" aria-hidden="true" />
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export const GitContributionsBlockDefinition: BlockDefinition = {
  type: 'GitContributionsBlock',
  label: 'Git Contributions',
  description: 'GitHub contribution heatmap with a link to your profile.',
  category: 'Hero',
  defaultProps: {
    title: 'Git Contributions',
    description: 'My open source activity on GitHub.',
    githubUrl: 'https://github.com/kuraykaraaslan',
    buttonLabel: 'View on GitHub',
  },
  schema: {
    title: { label: 'Title', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    githubUrl: { label: 'GitHub Profile URL', type: 'url' },
    buttonLabel: { label: 'Button Label', type: 'text' },
  },
  Component: GitContributionsBlock as unknown as BlockDefinition['Component'],
}

export default GitContributionsBlock
