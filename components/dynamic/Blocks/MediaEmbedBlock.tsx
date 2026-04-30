'use client'

import type { BlockDefinition } from '../types'

function MediaEmbedBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const embedUrl = rawProps.embedUrl as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-10">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>{subtitle}</p>}
          </div>
        )}
        {embedUrl && (
          <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </section>
  )
}

export const MediaEmbedBlockDefinition: BlockDefinition = {
  type: 'MediaEmbedBlock',
  label: 'Media Embed',
  category: 'Media',
  description: 'Embed a video, webinar, or external media asset.',
  defaultProps: {
    heading: 'Watch the Demo',
    subtitle: 'See the platform in action',
    embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    embedUrl: { label: 'Embed URL', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: MediaEmbedBlock,
}

export default MediaEmbedBlock