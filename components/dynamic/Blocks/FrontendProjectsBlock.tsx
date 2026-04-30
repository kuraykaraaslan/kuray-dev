'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import axiosInstance from '@/libs/axios'
import type { BlockDefinition } from '../types'

interface Project {
  projectId: string
  title: string
  description: string
  slug: string
  image?: string
  platforms?: string[]
  technologies?: string[]
}

function FrontendProjectsBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'My Projects'
  const description = (rawProps.description as string) || 'A selection of recent work.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'View All Projects'
  const ctaHref = (rawProps.ctaHref as string) || '/projects'
  const pageSize = Number(rawProps.pageSize) || 6
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b1))'

  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    axiosInstance
      .get(`/api/projects?pageSize=${pageSize}&sort=desc&onlyPublished=true`)
      .then((res) => setProjects(res.data.projects ?? []))
      .catch(() => { /* silently fail */ })
  }, [pageSize])

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-base-content mb-3">{heading}</h2>
          <p className="text-base-content/60 text-lg">{description}</p>
        </div>

        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.projectId}
                href={`/projects/${project.slug}`}
                className="group rounded-2xl overflow-hidden bg-base-100 border border-base-content/10 hover:shadow-xl hover:-translate-y-1 transition-all block"
              >
                {project.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="p-5">
                  <h3 className="font-bold text-base-content text-lg mb-1">{project.title}</h3>
                  <p className="text-sm text-base-content/60 line-clamp-2">{project.description}</p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-base-content/30 text-sm">No projects found.</div>
        )}

        <div className="text-center mt-12">
          <Link href={ctaHref} className="btn btn-outline">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

export const FrontendProjectsBlockDefinition: BlockDefinition = {
  type: 'FrontendProjectsBlock',
  label: 'Live Projects',
  description: 'Fetches published projects from the site API and renders a project grid.',
  category: 'Frontend',
  defaultProps: {
    heading: 'My Projects',
    description: 'A selection of recent work.',
    ctaLabel: 'View All Projects',
    ctaHref: '/projects',
    pageSize: 6,
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    ctaLabel: { label: 'CTA Label', type: 'text' },
    ctaHref: { label: 'CTA URL', type: 'url' },
    pageSize: { label: 'Number of Projects', type: 'number' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: FrontendProjectsBlock,
}

export default FrontendProjectsBlock
