import ProjectService from '@/services/ProjectService'
import OGService from '@/services/OGService'

export const alt = 'Project Cover'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ projectSlug: string }> }) {
  const { projectSlug } = await params

  const { projects } = await ProjectService.getAllProjects({
    page: 0,
    pageSize: 1,
    projectSlug,
  })
  const project = projects[0]

  if (!project) {
    return new Response('Not Found', { status: 404 })
  }

  const title = project.title.length > 110 ? project.title.slice(0, 100) + '…' : project.title

  return OGService.generate(
    {
      title,
      coverImage: project.image ?? null,
      badge: 'Project',
    },
    `project:og:${project.projectId}`
  )
}
