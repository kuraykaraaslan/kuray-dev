'use client'

import { GoogleAnalytics } from '@next/third-parties/google'
import WebVitals from '@/components/frontend/WebVitals'
import { useCookieConsentStore } from '@/libs/zustand/useCookieConsentStore'

const GA_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG

export default function ConsentedAnalytics() {
  const status = useCookieConsentStore((s) => s.status)
  if (status !== 'accepted') return null
  return (
    <>
      <WebVitals />
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </>
  )
}
