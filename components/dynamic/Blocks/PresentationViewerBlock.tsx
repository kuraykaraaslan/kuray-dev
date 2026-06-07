'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

type ViewerType = 'native' | 'office365' | 'google'
type FileType = 'auto' | 'pdf' | 'pptx'

function resolveIframeSrc(fileUrl: string, fileType: FileType, viewer: ViewerType): string {
  const ext = fileUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? ''
  const isPdf = fileType === 'pdf' || (fileType === 'auto' && ext === 'pdf')

  if (viewer === 'google') {
    return `https://docs.google.com/gviewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
  }
  if (!isPdf || viewer === 'office365') {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`
  }
  return fileUrl
}

function PresentationViewerBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const fileUrl = (rawProps.fileUrl as string) || ''
  const fileType = ((rawProps.fileType as string) || 'auto') as FileType
  const viewer = ((rawProps.viewer as string) || 'office365') as ViewerType
  const viewerHeight = (rawProps.viewerHeight as number) || 600

  return (
    <BaseBlock {...baseProps}>
      <div className="py-12 px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-10">
              {heading && <h2 className="text-3xl md:text-4xl text-base-content mb-3">{heading}</h2>}
              {subtitle && <p className="text-base text-base-content/60">{subtitle}</p>}
            </div>
          )}

          {fileUrl ? (
            <div className="rounded-xl overflow-hidden border border-base-content/10 shadow-sm">
              <iframe
                src={resolveIframeSrc(fileUrl, fileType, viewer)}
                width="100%"
                height={viewerHeight}
                className="block"
                allowFullScreen
                title={heading || 'Presentation'}
              />
            </div>
          ) : (
            <div
              className="rounded-xl border-2 border-dashed border-base-content/15 flex items-center justify-center text-base-content/30 text-sm"
              style={{ height: viewerHeight }}
            >
              No file URL configured
            </div>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const PresentationViewerBlockDefinition: BlockDefinition = {
  type: 'PresentationViewerBlock',
  label: 'Presentation Viewer',
  category: 'Media',
  description: 'Embed a PDF or PowerPoint (PPTX) file in an iframe.',
  icon: '📊',
  defaultProps: {
    heading: '',
    subtitle: '',
    fileUrl: '',
    fileType: 'auto',
    viewer: 'office365',
    viewerHeight: 600,
    blockClass: 'bg-base-100',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text', placeholder: 'Q4 Investor Deck' },
    subtitle: { label: 'Subtitle', type: 'text' },
    fileUrl: {
      label: 'File (PDF / PPTX)',
      type: 'file',
      uploadFolder: 'files',
      accept: '.pdf,.pptx,.ppt,.pps,.ppsx',
      placeholder: 'https://…/presentation.pdf',
      description: 'Upload a PDF or PPTX, or paste a public URL.',
    },
    fileType: {
      label: 'File Type',
      type: 'select',
      options: [
        { label: 'Auto-detect', value: 'auto' },
        { label: 'PDF', value: 'pdf' },
        { label: 'PowerPoint (PPTX)', value: 'pptx' },
      ],
      description: 'Used to pick the right viewer. "Auto" reads the file extension.',
    },
    viewer: {
      label: 'Viewer',
      type: 'select',
      options: [
        { label: 'Office 365 Online (PPTX / PDF)', value: 'office365' },
        { label: 'Native browser (PDF only)', value: 'native' },
        { label: 'Google Docs Viewer', value: 'google' },
      ],
      description: 'Office 365 and Google viewers require the file to be publicly accessible.',
    },
    viewerHeight: {
      label: 'Viewer Height (px)',
      type: 'number',
      min: 200,
      max: 1200,
      step: 50,
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: PresentationViewerBlock as unknown as BlockDefinition['Component'],
}

export default PresentationViewerBlock
