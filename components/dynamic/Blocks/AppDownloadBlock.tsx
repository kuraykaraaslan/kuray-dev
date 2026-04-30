'use client'

import type { BlockDefinition } from '../types'

function AppDownloadBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Get the App'
  const headingAccent = rawProps.headingAccent as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const appStoreUrl = (rawProps.appStoreUrl as string) || '#'
  const googlePlayUrl = (rawProps.googlePlayUrl as string) || '#'
  const appStoreLabel = (rawProps.appStoreLabel as string) || 'Download on the'
  const appStoreName = (rawProps.appStoreName as string) || 'App Store'
  const googlePlayLabel = (rawProps.googlePlayLabel as string) || 'Get it on'
  const googlePlayName = (rawProps.googlePlayName as string) || 'Google Play'
  const badgeNote = rawProps.badgeNote as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const badgeBg = (rawProps.badgeBgColor as string) || '#000000'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-3xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-4xl md:text-5xl text-white mb-4 leading-tight">
          {heading}
          {headingAccent && (
            <> <span style={{ color: accent }}>{headingAccent}</span></>
          )}
        </h2>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {subtitle}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* App Store */}
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 px-6 py-3.5 rounded-xl transition-all hover:scale-105 hover:opacity-90 min-w-[200px]"
            style={{ backgroundColor: badgeBg, border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {/* Apple logo */}
            <svg width="28" height="28" viewBox="0 0 814 1000" fill="white">
              <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-42.3-150.3-96c-52.2-61.3-96.3-155.6-96.3-245.3 0-130.4 85.1-199.5 168.5-199.5 79.6 0 130.8 52.7 175.6 52.7 43.2 0 100.9-55.7 188.5-55.7zm-156.9-153.2c37.3-44.3 64-105.9 64-167.5 0-8.5-.7-17.1-2.1-25.6-60.7 2.3-132.3 40.7-175.6 89.7-34.2 38.5-64 99.8-64 162.3 0 9.1 1.4 18.2 2.1 21.1 3.5.7 9.2 1.4 14.9 1.4 54.4 0 121.4-36.3 160.7-81.4z" />
            </svg>

            <div className="text-left">
              <p className="text-[10px] leading-none text-white/60 tracking-wide">{appStoreLabel}</p>
              <p className="text-lg font-semibold leading-tight text-white">{appStoreName}</p>
            </div>
          </a>

          {/* Google Play */}
          <a
            href={googlePlayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3.5 px-6 py-3.5 rounded-xl transition-all hover:scale-105 hover:opacity-90 min-w-[200px]"
            style={{ backgroundColor: badgeBg, border: '1px solid rgba(255,255,255,0.15)' }}
          >
            {/* Google Play logo */}
            <svg width="26" height="28" viewBox="0 0 512 512" fill="none">
              <path d="M48 28.6L275.7 256 48 483.4V28.6z" fill="#34A853" />
              <path d="M48 28.6l312.4 150.8-84.7 76.6L48 28.6z" fill="#FBBC04" />
              <path d="M48 483.4l227.7-227.4-84.7-76.6L48 483.4z" fill="#EA4335" />
              <path d="M360.4 179.4L464 232c24.7 11.9 24.7 44.2 0 56.1l-103.6 52.6-84.7-84.7 84.7-76.6z" fill="#4285F4" />
            </svg>

            <div className="text-left">
              <p className="text-[10px] leading-none text-white/60 tracking-wide">{googlePlayLabel}</p>
              <p className="text-lg font-semibold leading-tight text-white">{googlePlayName}</p>
            </div>
          </a>
        </div>

        {/* Optional note */}
        {badgeNote && (
          <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            {badgeNote}
          </p>
        )}

        {/* Decorative accent line */}
        <div
          className="mx-auto mt-12 h-0.5 w-24 rounded-full"
          style={{ backgroundColor: accent, opacity: 0.4 }}
        />
      </div>
    </section>
  )
}

export const AppDownloadBlockDefinition: BlockDefinition = {
  type: 'AppDownloadBlock',
  label: 'App Download',
  description: 'App Store + Google Play download badges with heading and subtitle',
  category: 'CTA',
  defaultProps: {
    heading: 'Take It With You',
    headingAccent: 'Anywhere.',
    subtitle: 'Download the app and stay connected to your projects on the go.',
    appStoreUrl: '#',
    appStoreLabel: 'Download on the',
    appStoreName: 'App Store',
    googlePlayUrl: '#',
    googlePlayLabel: 'Get it on',
    googlePlayName: 'Google Play',
    badgeNote: 'Free to download. Available on iOS 15+ and Android 10+.',
    bgColor: '#282626',
    accentColor: '#ffc418',
    badgeBgColor: '#000000',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    headingAccent: { label: 'Heading Accent (yellow)', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'textarea' },
    appStoreUrl: { label: 'App Store URL', type: 'url' },
    appStoreLabel: { label: 'App Store — small text', type: 'text' },
    appStoreName: { label: 'App Store — store name', type: 'text' },
    googlePlayUrl: { label: 'Google Play URL', type: 'url' },
    googlePlayLabel: { label: 'Google Play — small text', type: 'text' },
    googlePlayName: { label: 'Google Play — store name', type: 'text' },
    badgeNote: { label: 'Footer note (optional)', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    badgeBgColor: { label: 'Badge Background Color', type: 'color' },
  },
  Component: AppDownloadBlock,
}

export default AppDownloadBlock
