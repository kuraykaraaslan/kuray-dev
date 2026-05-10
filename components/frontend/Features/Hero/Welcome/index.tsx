'use client'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faLink } from '@fortawesome/free-solid-svg-icons'
import Link from '@/libs/i18n/Link'
import dynamic from 'next/dynamic'
import { useTranslation } from 'react-i18next'
import type { BlockDefinition } from '@/components/dynamic/types'

const TypingEffect = dynamic(() => import('./Partials/TypingEffect'), { ssr: false })
const MyImage = dynamic(() => import('./Partials/MyImageVideo'), { ssr: false })

interface WelcomeProps {
  typingPrefix?: string
  typingSuffix?: string
  typingTexts?: unknown
  description?: string
  ctaLabel?: string
  ctaHref?: string
}

const Welcome = ({
  typingPrefix,
  typingSuffix,
  typingTexts,
  description,
  ctaLabel,
  ctaHref,
}: WelcomeProps) => {
  const { t } = useTranslation()

  const resolvedCtaLabel = ctaLabel ?? t('pages.hero.contact_me')
  const resolvedCtaHref = ctaHref ?? '#contact'
  const resolvedDescription = description ?? null

  const resolvedTexts = Array.isArray(typingTexts) ? (typingTexts as string[]) : undefined

  return (
    <div className="relative bg-base-200" style={{ height: '100dvh' }} id="home">
      <div
        className="hero min-h-screen select-none group"
        style={{
          zIndex: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 1600 800'%3E%3Cg fill-opacity='0.39'%3E%3Cpolygon fill='%23222222' points='800 100 0 200 0 800 1600 800 1600 200'/%3E%3Cpolygon fill='%23444444' points='800 200 0 400 0 800 1600 800 1600 400'/%3E%3Cpolygon fill='%23666666' points='800 300 0 600 0 800 1600 800 1600 600'/%3E%3Cpolygon fill='%23888888' points='1600 800 800 400 0 800'/%3E%3Cpolygon fill='%23aaaaaa' points='1280 800 800 500 320 800'/%3E%3Cpolygon fill='%23cccccc' points='533.3 800 1066.7 800 800 600'/%3E%3Cpolygon fill='%23EEE' points='684.1 800 914.3 800 800 700'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
        }}
      >
        <div className="hero-content">
          <div className="flex-1 max-w-2xl md:me-4">
            <h1 className="font-bold relative overflow-hidden animate-shake text-5xl leading-normal h-32 md:h-16">
              <TypingEffect
                prefix={typingPrefix}
                suffix={typingSuffix}
                texts={resolvedTexts}
              />
            </h1>

            <h2 className="py-3 pb-6 leading-7 text-lg">
              {resolvedDescription ? (
                <p dangerouslySetInnerHTML={{ __html: resolvedDescription }} />
              ) : (
                <p>
                  <span
                    dangerouslySetInnerHTML={{ __html: t('pages.hero.description') }}
                  />
                </p>
              )}
            </h2>

            <Link href={resolvedCtaHref} className="btn btn-primary hidden lg:inline-flex">
              <FontAwesomeIcon icon={faArrowRight} className="mt-1" style={{ width: '1rem' }} />
              {resolvedCtaLabel}
            </Link>

            <Link
              href="https://drive.google.com/file/d/17Ya5AC2nvcvccN-bS2pFsKFIm5v8dcWN/view?usp=drive_link"
              target="_blank"
            >
              <p className="btn btn-ghost ms-2 lowercase hidden">
                <FontAwesomeIcon icon={faLink} className="mt-1" style={{ width: '1rem' }} />
                {t('pages.hero.resume')}
              </p>
            </Link>
          </div>

          <MyImage />
        </div>
      </div>
    </div>
  )
}

export const WelcomeBlockDefinition: BlockDefinition = {
  type: 'WelcomeBlock',
  label: 'Welcome / Hero',
  description: 'Full-screen hero section with typing effect, description and CTA button.',
  category: 'Hero',
  defaultProps: {
    typingPrefix: "I'm ready to",
    typingSuffix: '',
    typingTexts: ['solve problems', 'build products', 'create solutions', 'make a difference', 'be challenged', 'freelance'],
    description: '<strong>Product-focused Full-Stack Developer</strong> with <strong>3+ years of experience</strong> delivering robust, scalable software solutions.',
    ctaLabel: 'Contact me',
    ctaHref: '#contact',
  },
  schema: {
    typingPrefix: { label: 'Typing Prefix', type: 'text', placeholder: "I'm ready to" },
    typingSuffix: { label: 'Typing Suffix', type: 'text', placeholder: '' },
    typingTexts: { label: 'Rotating Texts (JSON array)', type: 'json', placeholder: '["solve problems", "build products"]' },
    description: { label: 'Description (HTML)', type: 'textarea', placeholder: 'Your description...' },
    ctaLabel: { label: 'CTA Button Label', type: 'text', placeholder: 'Contact me' },
    ctaHref: { label: 'CTA Button URL', type: 'url', placeholder: '#contact' },
  },
  Component: Welcome as unknown as BlockDefinition['Component'],
}

export default Welcome
