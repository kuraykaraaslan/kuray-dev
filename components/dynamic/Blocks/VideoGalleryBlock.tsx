'use client'

import type { BlockDefinition } from '../types'

interface Video {
  title: string
  description?: string
  videoUrl: string
  thumbnail?: string
}

function VideoGalleryBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  //const accent = (rawProps.accentColor as string) || '#ffc418'

  let videos: Video[] = []
  try {
    const raw = rawProps.videos
    videos = typeof raw === 'string' ? JSON.parse(raw) : (raw as Video[]) ?? []
  } catch {
    videos = []
  }

  const extractYouTubeId = (url: string) => {
    const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.{11})/)
    return match ? match[1] : null
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {videos.map((video, i) => {
            const youtubeId = extractYouTubeId(video.videoUrl)

            return (
              <div key={i} className="rounded-lg overflow-hidden hover:shadow-xl transition">
                <div className="relative w-full pb-[56.25%] bg-black">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div
                      className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-4xl"
                      style={{ backgroundColor: cardBg }}
                    >
                      ▶️
                    </div>
                  )}
                </div>

                {(video.title || video.description) && (
                  <div className="p-6" style={{ backgroundColor: cardBg }}>
                    {video.title && <h3 className="text-lg text-white font-bold mb-2">{video.title}</h3>}
                    {video.description && (
                      <p style={{ color: 'rgba(255,255,255,0.6)' }}>{video.description}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const VideoGalleryBlockDefinition: BlockDefinition = {
  type: 'VideoGalleryBlock',
  label: 'Video Gallery',
  category: 'Media',
  description: 'Display video gallery with embedded videos.',
  defaultProps: {
    heading: 'Video Tutorials',
    subtitle: 'Learn how to get the most out of our platform',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    videos: JSON.stringify([
      {
        title: 'Getting Started',
        description: 'A quick guide to get up and running',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        title: 'Advanced Features',
        description: 'Unlock the full potential of the platform',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
      {
        title: 'Best Practices',
        description: 'Tips and tricks from our experts',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    videos: { label: 'Videos (JSON)', type: 'json' },
  },
  Component: VideoGalleryBlock,
}

export default VideoGalleryBlock
