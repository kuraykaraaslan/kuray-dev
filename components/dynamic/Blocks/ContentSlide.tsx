'use client'

import Image from 'next/image'
import Link from 'next/link'

export interface ContentSlideProps {
  image?: string
  title?: string
  subtitle?: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
  index?: number
}

export default function ContentSlide({
  image,
  title,
  subtitle,
  description,
  ctaLabel,
  ctaHref,
  index = 0,
}: ContentSlideProps) {
  return (
    <div className="relative w-full h-full flex-shrink-0" style={{ minHeight: 480 }}>
      {image ? (
        <Image
          src={image}
          alt={title || `Slide ${index + 1}`}
          fill
          className="object-cover"
          sizes="100vw"
          priority={index === 0}
        />
      ) : (
        <div className="absolute inset-0 bg-base-300" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />

      <div className="relative z-10 h-full flex items-center px-8 md:px-16 lg:px-24 py-20">
        <div className="max-w-xl">
          {subtitle && (
            <p className="text-sm font-semibold uppercase tracking-widest text-white/70 mb-3">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-base text-white/80 mb-8 leading-relaxed">{description}</p>
          )}
          {ctaLabel && ctaHref && (
            <Link href={ctaHref} className="btn btn-primary">
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
