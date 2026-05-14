'use client'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesDown, faAnglesUp } from '@fortawesome/free-solid-svg-icons'
import axiosInstance from '@/libs/axios'
import SingleProject from '@/components/frontend/Features/Hero/Projects/Partials/SingleProject'
import type { Project } from '@/types/content/ProjectTypes'
import type { BlockDefinition } from '../types'
import { usePreviewMode } from '../partials/PreviewContext'

interface FilterItem {
  label: string
  value: string
}

type StaticProject = Omit<Project, 'projectId' | 'status' | 'content' | 'keywords' | 'updatedAt' | 'deletedAt'>

const DEFAULT_FILTERS: FilterItem[] = [
  { label: 'UI/UX',            value: 'ui/ux' },
  { label: 'Web',              value: 'web' },
  { label: 'Mobile',           value: 'mobile' },
  { label: 'Desktop',          value: 'desktop' },
  { label: 'Embedded',         value: 'embedded' },
  { label: 'Other',            value: 'other' },
  { label: 'IoT',              value: 'iot' },
  { label: 'Gaming',           value: 'gaming' },
  { label: 'Machine Learning', value: 'machine learning' },
]

const DEFAULT_STATIC_PROJECTS: StaticProject[] = [
  {
    title: 'My Project',
    description: 'A short description of the project.',
    image: '',
    slug: 'https://github.com/kuraykaraaslan/',
    technologies: ['Next.js', 'TypeScript'],
    projectLinks: ['https://github.com/kuraykaraaslan/'],
    platforms: ['web'],
    createdAt: new Date('2024-01-01'),
  },
]

function parseFilters(raw: unknown): FilterItem[] {
  if (Array.isArray(raw)) return raw as FilterItem[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_FILTERS
}

function parseStaticProjects(raw: unknown): StaticProject[] {
  if (Array.isArray(raw)) return raw as StaticProject[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function coerceArray(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string') return v.split(',').map((x) => x.trim()).filter(Boolean)
  return []
}

function toProjectShape(p: StaticProject): Project {
  const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date((p.createdAt as unknown as string) || 0)
  return {
    projectId: '',
    status: 'PUBLISHED',
    content: '',
    keywords: [],
    updatedAt: null,
    ...p,
    createdAt,
    platforms: coerceArray(p.platforms),
    technologies: coerceArray(p.technologies),
    projectLinks: coerceArray(p.projectLinks),
  }
}

function ProjectsBlock(rawProps: Record<string, unknown>) {
  const title         = (rawProps.title as string)         || 'Projects'
  const description   = (rawProps.description as string)   || 'A selection of projects I have built.'
  const showMoreLabel = (rawProps.showMoreLabel as string) || 'Show More'
  const showLessLabel = (rawProps.showLessLabel as string) || 'Show Less'
  const allLabel      = (rawProps.allLabel as string)      || 'All'
  const dataSource    = (rawProps.dataSource as string)    || 'api'
  const previewMode = usePreviewMode()
  const baseProps = parseBaseBlockProps(rawProps)

  const filters     = parseFilters(rawProps.filters)
  const staticItems = parseStaticProjects(rawProps.projects)

  const [dbProjects, setDbProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('')
  const [expanded, setExpanded] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dataSource === 'manual') return
    setLoading(true)
    axiosInstance
      .get('/api/projects?page=0&pageSize=100&sort=desc&onlyPublished=true')
      .then((res) => setDbProjects(res.data.projects ?? []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [dataSource])

  const handleExpand = () => {
    const panel = container.current
    if (!panel) return
    panel.style.height = expanded ? '560px' : `${panel.scrollHeight + 80}px`
    setExpanded(!expanded)
  }

  const apiProjects: Project[] = dataSource === 'manual' ? [] : dbProjects
  const manualProjects: Project[] = dataSource === 'api' ? [] : staticItems.map(toProjectShape)

  const allProjects: Project[] = [...apiProjects, ...manualProjects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const filtered = allProjects.filter((p) => !filter || p.platforms.includes(filter))

  return (
    <BaseBlock {...baseProps}>
      <div
        className="relative z-10 px-4 mx-auto max-w-screen-xl lg:pb-16 lg:px-6 duration-1000"
        style={{ height: '560px', overflow: 'clip' }}
        ref={container}
      >
        <div className="mx-auto max-w-screen-sm text-center lg:mb-8 -mt-8 lg:mt-0">
          <h2 className="mb-4 text-3xl lg:text-4xl tracking-tight font-extrabold">{title}</h2>
          <p className="font-light sm:text-xl">{description}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8 mt-3">
          <button
            className={`btn btn-primary ${filter === '' ? 'btn-active' : ''}`}
            onClick={() => setFilter('')}
          >
            {allLabel}
          </button>
          {filters.map((f) => (
            <button
              key={f.value}
              className={`btn btn-primary ${filter === f.value ? 'btn-active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-md text-base-content/40" />
          </div>
        ) : (
          <div className={`grid gap-8 mt-8 ${previewMode === 'mobile' ? '' : 'lg:grid-cols-3'}`}>
            {filtered.map((project, i) => (
              <SingleProject key={i} project={project} />
            ))}
          </div>
        )}
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
    </BaseBlock>
  )
}

export const ProjectsBlockDefinition: BlockDefinition = {
  type: 'ProjectsBlock',
  label: 'Projects',
  description: 'Filterable, collapsible project grid — DB, manual, or mixed with date-based sorting.',
  category: 'Hero',
  defaultProps: {
    title: 'Projects',
    description: 'A selection of projects I have built.',
    showMoreLabel: 'Show More',
    showLessLabel: 'Show Less',
    allLabel: 'All',
    dataSource: 'api',
    filters: DEFAULT_FILTERS,
    projects: DEFAULT_STATIC_PROJECTS,
    blockClass: 'bg-base-200 pt-16',
    sectionId: 'portfolio',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title:         { label: 'Section Title',       type: 'text' },
    description:   { label: 'Section Description', type: 'textarea' },
    showMoreLabel: { label: '"Show More" Label',   type: 'text' },
    showLessLabel: { label: '"Show Less" Label',   type: 'text' },
    allLabel:      { label: '"All" Button Label',  type: 'text', placeholder: 'All' },
    dataSource: {
      label: 'Data Source',
      type: 'select',
      options: ['api', 'manual', 'both'],
      value: 'api',
    },
    filters: {
      label: 'Filter Buttons',
      type: 'repeater',
      fields: {
        label: { label: 'Button Label',                     type: 'text', placeholder: 'Web' },
        value: { label: 'Platform Value (matches DB tags)', type: 'text', placeholder: 'web' },
      },
    },
    projects: {
      label: 'Static Projects (manual / both)',
      type: 'repeater',
      fields: {
        title:        { label: 'Title',                                    type: 'text',     value: '' },
        description:  { label: 'Description',                              type: 'textarea', value: '' },
        image:        { label: 'Cover Image',                              type: 'img',      uploadFolder: 'projects', value: '' },
        slug:         { label: 'Card Link (URL or /projects/my-project)',  type: 'url',      value: '' },
        createdAt:    { label: 'Date (for sort order, e.g. 2024-06-01)',   type: 'text',     placeholder: '2024-06-01', value: '' },
        technologies: { label: 'Technologies (comma-separated)',           type: 'text',     placeholder: 'Next.js, TypeScript', value: '' },
        projectLinks: { label: 'Project Links (comma-separated URLs)',     type: 'text',     placeholder: 'https://...', value: '' },
        platforms:    { label: 'Platforms (comma-separated, for filters)', type: 'text',     placeholder: 'web, mobile', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ProjectsBlock as unknown as BlockDefinition['Component'],
}

export default ProjectsBlock
