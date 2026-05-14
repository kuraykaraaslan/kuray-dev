'use client'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faAnglesUp } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from '@/libs/axios'
import SingleProject from '@/components/frontend/Features/Hero/Projects/Partials/SingleProject'
import type { Project } from '@/types/content/ProjectTypes'
import type { BlockDefinition } from '../types'

const ALLOWED_FILTERS = ['ui/ux', 'web', 'mobile', 'desktop', 'embedded', 'other', 'iot', 'gaming', 'machine learning']

function ProjectsBlock(rawProps: Record<string, unknown>) {
  const title = (rawProps.title as string) || 'Projects'
  const description = (rawProps.description as string) || 'A selection of projects I have built.'
  const githubUrl = (rawProps.githubUrl as string) || 'https://github.com/kuraykaraaslan/'
  const showMoreLabel = (rawProps.showMoreLabel as string) || 'Show More'
  const showLessLabel = (rawProps.showLessLabel as string) || 'Show Less'

  const [projects, setProjects] = useState<Project[]>([])
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    axiosInstance
      .get('/api/projects?page=0&pageSize=100&sort=desc&onlyPublished=true')
      .then((res) => setProjects(res.data.projects))
      .catch(console.error)
  }, [])

  const handleExpand = () => {
    const panel = container.current
    if (!panel) return
    panel.style.height = expanded ? '560px' : `${panel.scrollHeight + 80}px`
    setExpanded(!expanded)
  }

  const continueOnGitHub: Project = {
    projectId: '',
    title: 'Other Projects',
    description: 'For other projects, check my GitHub profile.',
    slug: githubUrl,
    image: '/assets/img/projects/github-wallpaper-scaled.webp',
    status: '',
    platforms: [],
    technologies: [],
    content: '',
    keywords: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    projectLinks: [githubUrl],
  }

  const filtered = projects.filter((p) => !filter || p.platforms.includes(filter))

  return (
    <section className="bg-base-200 pt-16" id="portfolio">
      <div
        className="px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6 duration-1000"
        style={{ height: '560px', overflow: 'clip' }}
        ref={container}
      >
        <div className="mx-auto max-w-screen-sm text-center lg:mb-8 -mt-8 lg:mt-0">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold">{title}</h2>
          <p className="font-light sm:text-xl">{description}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8 mt-3">
          <button className={`btn btn-primary ${filter === '' ? 'btn-active' : ''}`} onClick={() => setFilter('')}>
            All
          </button>
          {ALLOWED_FILTERS.map((tag) => (
            <button
              key={tag}
              className={`btn btn-primary ${filter === tag ? 'btn-active' : ''}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-3 mt-8">
          {filtered.map((project, i) => <SingleProject key={i} project={project} />)}
          <SingleProject key="github" project={continueOnGitHub} />
        </div>
      </div>

      <div style={{ zIndex: 8, position: 'relative', left: 0, right: 0, margin: 'auto', height: 0, width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div
          className="bg-gradient-to-b from-base-200/20 to-base-300"
          style={{ zIndex: 8, position: 'relative', height: '80px', width: '100%', display: 'flex', justifyContent: 'center', transform: 'translateY(-80px)' }}
        >
          <button
            className={`flex flex-col items-center gap-2 ${!expanded ? 'animate-bounce' : ''}`}
            style={{ height: '80px', width: '130px' }}
            onClick={handleExpand}
          >
            <FontAwesomeIcon icon={expanded ? faAnglesUp : faAnglesDown} style={{ width: '2.0rem', height: '2.0rem' }} />
            <span>{expanded ? showLessLabel : showMoreLabel}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export const ProjectsBlockDefinition: BlockDefinition = {
  type: 'ProjectsBlock',
  label: 'Projects',
  description: 'Filterable, collapsible project grid loaded from the database.',
  category: 'Hero',
  defaultProps: {
    title: 'Projects',
    description: 'A selection of projects I have built.',
    githubUrl: 'https://github.com/kuraykaraaslan/',
    showMoreLabel: 'Show More',
    showLessLabel: 'Show Less',
  },
  schema: {
    title: { label: 'Section Title', type: 'text' },
    description: { label: 'Section Description', type: 'textarea' },
    githubUrl: { label: 'GitHub Profile URL', type: 'url' },
    showMoreLabel: { label: '"Show More" Label', type: 'text' },
    showLessLabel: { label: '"Show Less" Label', type: 'text' },
  },
  Component: ProjectsBlock as unknown as BlockDefinition['Component'],
}

export default ProjectsBlock
