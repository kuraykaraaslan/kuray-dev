'use client'
import { useState, createRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faPlayCircle, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import dynamic from 'next/dynamic'
import { HeadlessModal, useModal } from '@/components/common/Modal'
import LoadingElement from '@/components/frontend/UI/Content/LoadingElement'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import { usePreviewMode } from '../partials/PreviewContext'
import type { BlockDefinition } from '../types'

const ReactPlayer = dynamic(() => import('react-player'), {
  ssr: false,
  loading: () => <LoadingElement title="Video Player" />,
})

// ── Photo Widget ──────────────────────────────────────────────────────────────

interface PhotoWidgetProps {
  src: string
  alt: string
  action: 'none' | 'modal-image' | 'modal-video' | 'link'
  actionUrl: string
  mobileLayout: 'hidden' | 'top' | 'bottom'
}

function PhotoWidget({ src, alt, action, actionUrl, mobileLayout }: PhotoWidgetProps) {
  const previewMode = usePreviewMode()
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

  const handleOverlayClick = () => {
    if (action === 'modal-video') handleVideoOpen()
    else if (action === 'modal-image') openImg()
  }

  const overlayIcon = action === 'modal-video'
    ? <FontAwesomeIcon icon={faPlayCircle} className="text-white w-10 h-10 sm:w-20 sm:h-20 md:w-24 md:h-24" />
    : action === 'modal-image'
      ? <FontAwesomeIcon icon={faMagnifyingGlass} className="text-white w-8 h-8 sm:w-14 sm:h-14 md:w-16 md:h-16" />
      : null

  const visibilityCls = mobileLayout === 'hidden' ? 'hidden sm:block' : 'block'

  return (
    <>
      <div className={`flex-none ${visibilityCls}`}>
        {/* Container fixes the photo size — overlay is placed inside so inset-0 aligns exactly */}
        <div className={`relative ${previewMode === 'mobile' ? 'w-24' : 'w-24 sm:w-48 md:w-64'} group`}>
          <Image
            src={src}
            alt={alt}
            width={256}
            height={256}
            className="w-full h-auto object-cover bg-primary"
          />

          {action !== 'none' && (
            <div
              className={[
                'absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity',
                action !== 'link' ? 'bg-black/50 cursor-pointer' : '',
              ].join(' ')}
              onClick={action !== 'link' ? handleOverlayClick : undefined}
            >
              {action === 'link' ? (
                <Link href={actionUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0" />
              ) : (
                overlayIcon
              )}
            </div>
          )}
        </div>
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

const HEADING_SIZE: Record<string, string> = {
  'text-2xl': 'text-2xl', 'text-3xl': 'text-3xl', 'text-4xl': 'text-4xl',
  'text-5xl': 'text-5xl', 'text-6xl': 'text-6xl', 'text-7xl': 'text-7xl', 'text-8xl': 'text-8xl',
}

const DESC_SIZE: Record<string, string> = {
  'text-sm': 'text-sm', 'text-base': 'text-base', 'text-lg': 'text-lg',
  'text-xl': 'text-xl', 'text-2xl': 'text-2xl', 'text-3xl': 'text-3xl',
}

function WelcomeBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Hello, I am Kuray'
  const description = (rawProps.description as string) || 'A passionate full-stack developer building modern web applications.'
  const ctaLabel = (rawProps.ctaLabel as string) || 'Contact Me'
  const ctaHref = (rawProps.ctaHref as string) || '#contact'

  const headingSize = HEADING_SIZE[(rawProps.headingSize as string) || ''] ?? 'text-5xl'
  const descSize    = DESC_SIZE[(rawProps.descSize as string) || '']    ?? 'text-lg'

  const photoSrc = (rawProps.photoSrc as string) || '/assets/img/kuraykaraaslan.jpg'
  const photoAlt = (rawProps.photoAlt as string) || 'Profile photo'
  const photoAction = ((rawProps.photoAction as string) || 'modal-video') as PhotoWidgetProps['action']
  const photoActionUrl = (rawProps.photoActionUrl as string) || 'https://www.youtube.com/watch?v=oJN50oOlW-c'
  const mobilePhoto = ((rawProps.mobilePhoto as string) || 'hidden') as PhotoWidgetProps['mobileLayout']

  const baseProps = parseBaseBlockProps(rawProps)

  return (
    <BaseBlock as="div" {...baseProps} style={{ height: '100dvh' }}>
      <div className="hero min-h-screen select-none" style={{ zIndex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
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
            <h1 className={`font-bold ${headingSize} leading-normal animate-shake`}>
              {heading}
            </h1>
            <h2 className={`py-3 pb-6 leading-7 ${descSize}`}>
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
    </BaseBlock>
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
    headingSize: 'text-5xl',
    descSize: 'text-lg',
    blockClass: 'bg-base-200',
    sectionId: 'home',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text', placeholder: 'Hello, I am ...' },
    headingSize: {
      label: 'Heading Size',
      type: 'select',
      options: ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl'],
      value: 'text-5xl',
    },
    description: { label: 'Description', type: 'textarea' },
    descSize: {
      label: 'Description Size',
      type: 'select',
      options: ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'],
      value: 'text-lg',
    },
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
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: WelcomeBlock as unknown as BlockDefinition['Component'],
}

export default WelcomeBlock
