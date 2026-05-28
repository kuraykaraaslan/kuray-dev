import Link from '@/libs/i18n/Link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleDot } from '@fortawesome/free-solid-svg-icons'
import { Project } from '@/types/content/ProjectTypes'

export default function RecentProjectItem({ project }: { project: Project }) {
  const isPublished = project.status === 'PUBLISHED'
  const techPreview = project.technologies?.[0]

  return (
    <Link
      href={`/admin/projects/${project.projectId}`}
      className="flex items-center gap-3 px-5 py-3 hover:bg-base-content/5 transition-colors"
    >
      <FontAwesomeIcon
        icon={isPublished ? faCircleCheck : faCircleDot}
        className={`w-3 h-3 flex-shrink-0 ${
          isPublished ? 'text-success' : 'text-base-content/30'
        }`}
      />
      <span className="text-sm text-base-content/80 truncate flex-1">{project.title}</span>
      {techPreview && (
        <span className="text-xs flex-shrink-0 px-2 py-0.5 rounded bg-base-content/5 text-base-content/40">
          {techPreview}
        </span>
      )}
    </Link>
  )
}
