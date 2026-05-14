import Image from 'next/image'
import type { BgProps } from '../utils/BlockBg'

const BG_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='0.39'%3E%3Cpolygon fill='%23222222' points='800 100 0 200 0 800 1600 800 1600 200'/%3E%3Cpolygon fill='%23444444' points='800 200 0 400 0 800 1600 800 1600 400'/%3E%3Cpolygon fill='%23666666' points='800 300 0 600 0 800 1600 800 1600 600'/%3E%3Cpolygon fill='%23888888' points='1600 800 800 400 0 800'/%3E%3Cpolygon fill='%23aaaaaa' points='1280 800 800 500 320 800'/%3E%3Cpolygon fill='%23cccccc' points='533.3 800 1066.7 800 800 600'/%3E%3Cpolygon fill='%23EEE' points='684.1 800 914.3 800 800 700'/%3E%3C/g%3E%3C/svg%3E")`

export default function BlockBackground({ bgType, bgImage, bgVideo, bgColor, bgOpacity }: BgProps) {
  const opacity = Math.min(100, Math.max(0, bgOpacity)) / 100

  if (bgType === 'svg') {
    return (
      <div
        aria-hidden
        className="absolute inset-0 z-0 w-full h-full pointer-events-none"
        style={{ backgroundImage: BG_SVG, backgroundSize: 'cover', backgroundAttachment: 'fixed', opacity }}
      />
    )
  }

  if (bgType === 'image' && bgImage) {
    return (
      <Image
        src={bgImage}
        alt=""
        fill
        aria-hidden
        className="object-cover z-0 pointer-events-none"
        style={{ opacity }}
        unoptimized={bgImage.startsWith('http')}
        priority={false}
      />
    )
  }

  if (bgType === 'video' && bgVideo) {
    return (
      <video
        muted loop autoPlay playsInline aria-hidden
        className="absolute inset-0 z-0 object-cover w-full h-full pointer-events-none"
        style={{ opacity }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>
    )
  }

  if (bgType === 'color' && bgColor) {
    return (
      <div
        aria-hidden
        className="absolute inset-0 z-0 pointer-events-none"
        style={{ backgroundColor: bgColor, opacity }}
      />
    )
  }

  return null
}
