'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCookieConsentStore } from '@/libs/zustand/useCookieConsentStore'

export function CookieConsentBar({ rawProps: p }: { rawProps: Record<string, unknown> }) {
  const [ready, setReady] = useState(false)
  const { status, accept, decline } = useCookieConsentStore()

  const isActive = p.isActive !== false
  const showDelay = typeof p.showDelay === 'number' ? p.showDelay : 0

  useEffect(() => {
    if (!isActive) return
    const t = setTimeout(() => setReady(true), showDelay * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!ready || !isActive || status !== undefined) return null

  const position = (p.position as string) || 'bottom'
  const backgroundColor = (p.backgroundColor as string) || '#1a1818'
  const textColor = (p.textColor as string) || 'rgba(255,255,255,0.6)'
  const borderColor = (p.borderColor as string) || 'rgba(255,255,255,0.1)'
  const message = (p.message as string) || 'We use cookies to improve your experience and analyze site usage. By continuing, you agree to our'
  const privacyPolicyText = (p.privacyPolicyText as string) || 'Privacy Policy'
  const privacyPolicyUrl = (p.privacyPolicyUrl as string) || '/privacy-policy'
  const acceptLabel = (p.acceptLabel as string) || 'Accept'
  const declineLabel = (p.declineLabel as string) || 'Decline'
  const showDecline = p.showDecline !== false
  const acceptBgColor = (p.acceptBgColor as string) || 'rgba(255,255,255,0.1)'
  const acceptTextColor = (p.acceptTextColor as string) || '#ffffff'
  const declineTextColor = (p.declineTextColor as string) || 'rgba(255,255,255,0.5)'

  const positionClass = position === 'top'
    ? 'top-0 left-0 right-0 border-b'
    : 'bottom-0 left-0 right-0 border-t'

  return (
    <div
      className={`fixed z-50 ${positionClass}`}
      style={{ backgroundColor, borderColor }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-sm leading-relaxed max-w-2xl" style={{ color: textColor }}>
          {message}{' '}
          <Link
            href={privacyPolicyUrl}
            className="underline transition-opacity hover:opacity-100"
            style={{ color: acceptTextColor }}
          >
            {privacyPolicyText}
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          {showDecline && (
            <button
              onClick={decline}
              className="px-4 py-2 text-sm transition-colors border rounded"
              style={{ color: declineTextColor, borderColor }}
            >
              {declineLabel}
            </button>
          )}
          <button
            onClick={accept}
            className="px-4 py-2 text-sm transition-colors border rounded"
            style={{ color: acceptTextColor, backgroundColor: acceptBgColor, borderColor }}
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
