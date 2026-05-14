'use client'
import { useState, createRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faPlayCircle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
import { HeadlessModal, useModal } from '@/components/common/Modal'
import LoadingElement from '@/components/frontend/UI/Content/LoadingElement'
import type { BlockDefinition } from '../types'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => <LoadingElement title="Video Player" />,
})

const BG_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='0.39'%3E%3Cpolygon fill='%23222222' points='800 100 0 200 0 800 1600 800 1600 200'/%3E%3Cpolygon fill='%23444444' points='800 200 0 400 0 800 1600 800 1600 400'/%3E%3Cpolygon fill='%23666666' points='800 300 0 600 0 800 1600 800 1600 600'/%3E%3Cpolygon fill='%23888888' points='1600 800 800 400 0 800'/%3E%3Cpolygon fill='%23aaaaaa' points='1280 800 800 500 320 800'/%3E%3Cpolygon fill='%23cccccc' points='533.3 800 1066.7 800 800 600'/%3E%3Cpolygon fill='%23EEE' points='684.1 800 914.3 800 800 700'/%3E%3C/g%3E%3C/svg%3E")`

// ── Photo Widget ──────────────────────────────────────────────────────────────

interface PhotoWidgetProps {
  src: string
  alt: string
  action: 'none' | 'modal-image' | 'modal-video' | 'link'
  actionUrl: string
  mobileLayout: 'hidden' | 'top' | 'bottom'
}

function PhotoWidget({ src, alt, action, actionUrl, mobileLayout }: PhotoWidgetProps) {
  const [playing, setPlaying] = useState(false)
  const player = createRef<any>()
  const { open: videoOpen, openModal: openVideo, closeModal: closeVideo } = useModal()
  const { open: imgOpen, openModal: openImg, closeModal: closeImg } = useModal()

  const handleVideoOpen = () => {
    openVideo()
    setTimeout(() => setPlaying(true), 600)
  }
  const handleVideoClose = () => {
    setPlaying(false)
    closeVideo()
  }

  const photoEl = (
    <Image
      src={src}
      alt={alt}
      width={256}
      height={256}
      className="max-w-24 sm:max-w-48 md:max-w-64 object-cover bg-primary"
    />
  )

  const overlayIcon = action === 'modal-video'
    ? <FontAwesomeIcon icon={faPlayCircle} className="text-white w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 m-auto" />
    : action === 'modal-image'
      ? <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white w-12 h-12 sm:w-16 sm:h-16 m-auto" />
      : null

  const wrapper = (children: React.ReactNode) => {
    if (action === 'link') {
      return (
        <Link href={actionUrl} target="_blank" rel="noopener noreferrer" className="w-full h-full flex items-center justify-center">
          {children}
        </Link>
      )
    }
    if (action === 'modal-video') {
      return (
        <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={handleVideoOpen}>
          {children}
        </div>
      )
    }
    if (action === 'modal-image') {
      return (
        <div className="w-full h-full flex items-center justify-center cursor-pointer" onClick={openImg}>
          {children}
        </div>
      )
    }
    return <>{children}</>
  }

  const visibilityCls = mobileLayout === 'hidden' ? 'hidden sm:block' : 'block'

  return (
    <>
      <div className={`relative flex-none ${visibilityCls} group`}>
        <div className="max-w-48 sm:max-w-48 md:max-w-64 bg-primary">
          {photoEl}
        </div>

        {overlayIcon && (
          <div className="absolute inset-0 max-w-48 sm:max-w-48 md:max-w-64 bg-black/50 w-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            {wrapper(overlayIcon)}
          </div>
        )}

        {action === 'link' && (
          <div className="absolute inset-0 max-w-48 sm:max-w-48 md:max-w-64 w-full opacity-0 group-hover:opacity-100 transition-opacity">
            {wrapper(null)}
          </div>
        )}
      </div>

      {/* Image modal */}
      <HeadlessModal open={imgOpen} onClose={closeImg} size="xl">
        <div className="flex items-center justify-center p-4">
          <Image src={src} alt={alt} width={800} height={800} className="object-contain max-h-[80vh] w-auto" />
        </div>
      </HeadlessModal>

      {/* Video modal */}
      <HeadlessModal open={videoOpen} onClose={handleVideoClose} showClose={false} size="xl" className="!bg-black overflow-hidden">
        <div className="-m-4">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ReactPlayer {...({ url: actionUrl, controls: true, width: '100%', height: '60vh', playing, ref: player } as any)} />
        </div>
      </HeadlessModal>
    </>
  )
}

// ── Block ─────────────────────────────────────────────────────────────────────

function WelcomeBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Hello, I am Kuray'
  const description = (rawProps.description as string) || 'A passionate full-stack developer building modern web applications.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'Contact Me'
  const ctaHref = (rawProps.ctaHref as string) || '#contact'

  const photoSrc = (rawProps.photoSrc as string) || '/assets/img/kuraykaraaslan.jpg'
  const photoAlt = (rawProps.photoAlt as string) || 'Profile photo'
  const photoAction = ((rawProps.photoAction as string) || 'modal-video') as PhotoWidgetProps['action']
  const photoActionUrl = (rawProps.photoActionUrl as string) || 'https://www.youtube.com/watch?v=oJN50oOlW-c'
  const mobilePhoto = ((rawProps.mobilePhoto as string) || 'hidden') as PhotoWidgetProps['mobileLayout']

  const backgroundType = (rawProps.backgroundType as string) || 'svg'
  const backgroundImage = (rawProps.backgroundImage as string) || ''

  const bgStyle: React.CSSProperties = {
    zIndex: 2,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  }

  if (backgroundType === 'svg') {
    bgStyle.backgroundImage = BG_SVG
    bgStyle.backgroundAttachment = 'fixed'
    bgStyle.backgroundSize = 'cover'
  }

  return (
    <div className="relative bg-base-200" style={{ height: '100dvh' }} id="home">
      {backgroundType === 'image' && backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Hero background"
          fill
          className="object-cover opacity-30 z-0"
          priority
          unoptimized={backgroundImage.startsWith('http')}
        />
      )}
      <div className="hero min-h-screen select-none" style={bgStyle}>
        <div
          className={[
            'hero-content relative z-10',
            mobilePhoto === 'top'    ? 'flex-col sm:flex-row-reverse' : '',
            mobilePhoto === 'bottom' ? 'flex-col sm:flex-row' : '',
          ].join(' ')}
        >
          {mobilePhoto === 'top' && (
            <PhotoWidget src={photoSrc} alt={photoAlt} action={photoAction} actionUrl={photoActionUrl} mobileLayout="top" />
          )}

          <div className="flex-1 max-w-2xl md:me-4">
            <h1 className="font-bold text-5xl leading-normal animate-shake">
              {heading}
            </h1>
            <h2 className="py-3 pb-6 leading-7 text-lg">
              <p>{description}</p>
            </h2>
            <Link href={ctaHref} className="btn btn-primary hidden lg:inline-flex">
              <FontAwesomeIcon icon={faArrowRight} className="mt-1" style={{ width: '1rem' }} />
              {ctaLabel}
            </Link>
          </div>

          {mobilePhoto !== 'top' && (
            <PhotoWidget src={photoSrc} alt={photoAlt} action={photoAction} actionUrl={photoActionUrl} mobileLayout={mobilePhoto} />
          )}
        </div>
      </div>
    </div>
  )
}

export const WelcomeBlockDefinition: BlockDefinition = {
  type: 'WelcomeBlock',
  label: 'Welcome Hero',
  description: 'Full-screen hero with heading, profile photo (modal / video / link), and configurable background.',
  category: 'Hero',
  defaultProps: {
    heading: 'Hello, I am Kuray',
    description: 'A passionate full-stack developer building modern web applications.',
    ctaLabel: 'Contact Me',
    ctaHref: '#contact',
    photoSrc: '/assets/img/kuraykaraaslan.jpg',
    photoAlt: 'Profile photo',
    photoAction: 'modal-video',
    photoActionUrl: 'https://www.youtube.com/watch?v=oJN50oOlW-c',
    mobilePhoto: 'hidden',
    backgroundType: 'svg',
    backgroundImage: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text', placeholder: 'Hello, I am ...' },
    description: { label: 'Description', type: 'textarea' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    photoSrc: { label: 'Profile Photo', type: 'img', uploadFolder: 'profile' },
    photoAlt: { label: 'Photo Alt Text', type: 'text' },
    photoAction: {
      label: 'Photo Click Action',
      type: 'select',
      options: ['none', 'modal-image', 'modal-video', 'link'],
    },
    photoActionUrl: {
      label: 'Action URL (video URL or link target)',
      type: 'url',
      placeholder: 'https://youtube.com/...',
    },
    mobilePhoto: {
      label: 'Mobile — Photo Position',
      type: 'select',
      options: ['hidden', 'top', 'bottom'],
    },
    backgroundType: {
      label: 'Background Type',
      type: 'select',
      options: ['svg', 'image', 'none'],
    },
    backgroundImage: {
      label: 'Background Image (if type = image)',
      type: 'img',
      uploadFolder: 'backgrounds',
      accept: 'image/*',
    },
  },
  Component: WelcomeBlock as unknown as BlockDefinition['Component'],
}

export default WelcomeBlock
