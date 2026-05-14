'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function MediaEmbedBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const embedUrl = rawProps.embedUrl as string | undefined

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-10">
              {heading && (
                <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>
              )}
              {subtitle && (
                <p className="text-lg text-base-content/70">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {embedUrl && (
            <div
              className="relative w-full overflow-hidden rounded-lg"
              style={{ paddingTop: '56.25%' }}
            >
              <iframe
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </BaseBlock>
  )
}

export const MediaEmbedBlockDefinition: BlockDefinition = {
  type: 'MediaEmbedBlock',
  label: 'Media Embed',
  category: 'Media',
  description: 'Embed a video, webinar, or external media asset via iframe (16:9 responsive).',
  defaultProps: {
    heading: 'Watch the Demo',
    subtitle: 'See the platform in action',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    blockClass: 'bg-base-100 pt-16',
    sectionId: 'media',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    embedUrl: { label: 'Embed URL', type: 'url' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: MediaEmbedBlock as unknown as BlockDefinition['Component'],
}

export default MediaEmbedBlock
