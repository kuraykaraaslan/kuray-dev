'use client'

import Link from 'next/link'

export function EditorPreview({ rawProps: p }: { rawProps: Record<string, unknown> }) {
  const isActive = p.isActive !== false
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
  const showDelay = typeof p.showDelay === 'number' ? p.showDelay : 0

  const barClasses = position === 'top' ? 'border-b' : 'border-t'

  return (
    <div className="relative w-full min-h-[300px] overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg,#e8edf5 0%,#d4dce8 100%)' }}>

      {/* Page skeleton */}
      <div className="absolute inset-0 p-8 space-y-3 pointer-events-none">
        <div className="h-5 w-48 bg-gray-300/60 rounded" />
        <div className="h-3 w-72 bg-gray-300/40 rounded" />
        <div className="h-3 w-64 bg-gray-300/40 rounded" />
        <div className="mt-4 h-24 w-full bg-gray-300/30 rounded" />
      </div>

      {/* Status badges */}
      <div className="absolute top-3 left-3 z-20 flex gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/20 text-green-700 ring-1 ring-green-500/30' : 'bg-red-500/20 text-red-700 ring-1 ring-red-500/30'}`}>
          {isActive ? '● Active' : '○ Inactive'}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 text-gray-600 ring-1 ring-gray-300/50">
          {position === 'top' ? '↑ Top' : '↓ Bottom'}
        </span>
        {showDelay > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/50 text-gray-600 ring-1 ring-gray-300/50">
            +{showDelay}s delay
          </span>
        )}
      </div>

      {/* Bar preview */}
      <div
        className={`absolute left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'} z-10 ${barClasses}`}
        style={{ backgroundColor, borderColor }}
      >
        <div className="px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm leading-relaxed max-w-xs" style={{ color: textColor }}>
            {message}{' '}
            <Link href={privacyPolicyUrl} className="underline" style={{ color: acceptTextColor }}>
              {privacyPolicyText}
            </Link>
            .
          </p>
          <div className="flex gap-2 shrink-0">
            {showDecline && (
              <button
                className="px-3 py-1.5 text-xs border rounded"
                style={{ color: declineTextColor, borderColor }}
              >
                {declineLabel}
              </button>
            )}
            <button
              className="px-3 py-1.5 text-xs border rounded"
              style={{ color: acceptTextColor, backgroundColor: acceptBgColor, borderColor }}
            >
              {acceptLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
