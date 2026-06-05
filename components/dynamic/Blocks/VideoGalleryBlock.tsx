'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface Video {
  title: string
  description?: string
  videoUrl: string
}

const DEFAULT_VIDEOS: Video[] = [
  { title: 'Getting Started', description: 'A quick guide to get up and running', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Advanced Features', description: 'Unlock the full potential of the platform', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
  { title: 'Best Practices', description: 'Tips and tricks from our experts', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
]

function parseVideos(raw: unknown): Video[] {
  if (Array.isArray(raw)) return raw as Video[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_VIDEOS
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.{11})/)
  return match ? match[1] : null
}

function VideoGalleryBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const videos = parseVideos(rawProps.videos)

  const videoSchemas = videos
    .filter((v) => extractYouTubeId(v.videoUrl))
    .map((v) => {
      const ytId = extractYouTubeId(v.videoUrl)!
      return {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: v.title,
        description: v.description || v.title,
        embedUrl: `https://www.youtube.com/embed/${ytId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
        url: `https://www.youtube.com/watch?v=${ytId}`,
      }
    })

  return (
    <BaseBlock {...baseProps}>
      {videoSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {videos.map((video, i) => {
            const youtubeId = extractYouTubeId(video.videoUrl)
            return (
              <div key={i} className="rounded-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative w-full pb-[56.25%] bg-black">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="absolute top-0 left-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-4xl bg-base-200">
                      ▶
                    </div>
                  )}
                </div>
                {(video.title || video.description) && (
                  <div className="p-6 bg-base-200">
                    {video.title && <h3 className="text-lg text-base-content font-bold mb-2">{video.title}</h3>}
                    {video.description && <p className="text-base-content/60">{video.description}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

export const VideoGalleryBlockDefinition: BlockDefinition = {
  type: 'VideoGalleryBlock',
  label: 'Video Gallery',
  category: 'Media',
  description: 'Display a video gallery with embedded YouTube videos.',
  defaultProps: {
    heading: 'Video Tutorials',
    subtitle: 'Learn how to get the most out of our platform',
    videos: DEFAULT_VIDEOS,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'video-gallery',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    videos: {
      label: 'Videos',
      type: 'repeater',
      fields: {
        title: { label: 'Title', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
        videoUrl: { label: 'YouTube URL', type: 'url', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: VideoGalleryBlock as unknown as BlockDefinition['Component'],
}

export default VideoGalleryBlock
