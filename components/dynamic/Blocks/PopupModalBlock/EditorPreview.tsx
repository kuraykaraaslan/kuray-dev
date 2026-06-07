'use client'

import { POS_CLASS, SIZE_CLASS } from './constants'
import { PopupCard } from './PopupCard'

export function EditorPreview({ rawProps: p }: { rawProps: Record<string, unknown> }) {
  const position = (p.position as string) || 'center'
  const size = (p.size as string) || 'md'
  const opacity = typeof p.overlayOpacity === 'number' ? p.overlayOpacity / 100 : 0.65
  const isActive = p.isActive !== false
  const frequency = (p.frequency as string) || 'EVERY_TIME'
  const showDelay = typeof p.showDelay === 'number' ? p.showDelay : 0
  const entryAnim = (p.entryAnimation as string) || 'zoom'
  const entryDur = typeof p.entryDuration === 'number' ? p.entryDuration : 0.35
  const exitAnim = (p.exitAnimation as string) || 'fade'
  const exitDur = typeof p.exitDuration === 'number' ? p.exitDuration : 0.22
  const visibleOn = (p.visibleOn as string) || 'all'

  const freqLabel = frequency === 'EVERY_TIME' ? 'Always' : frequency === 'ONCE' ? 'Once' : 'Per session'
  const deviceLabel: Record<string, string> = {
    all: '📱💻', mobile: '📱', tablet: '📲', desktop: '💻',
    'mobile-tablet': '📱📲', 'tablet-desktop': '📲💻',
  }

  return (
    <div className="relative w-full min-h-[480px] overflow-hidden select-none"
      style={{ background: 'linear-gradient(135deg,#e8edf5 0%,#d4dce8 100%)' }}>
      {/* Page skeleton */}
      <div className="absolute inset-0 p-8 space-y-3 pointer-events-none">
        <div className="h-5 w-48 bg-gray-300/60 rounded" />
        <div className="h-3 w-72 bg-gray-300/40 rounded" />
        <div className="h-3 w-64 bg-gray-300/40 rounded" />
        <div className="mt-4 h-24 w-full bg-gray-300/30 rounded" />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${opacity})` }} />

      {/* Status badges */}
      <div className="absolute top-3 left-3 z-20 flex gap-1.5 flex-wrap">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isActive ? 'bg-green-500/20 text-green-300 ring-1 ring-green-500/30' : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/30'}`}>
          {isActive ? '● Active' : '○ Inactive'}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">{freqLabel}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">{deviceLabel[visibleOn] ?? visibleOn}</span>
        {showDelay > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/60 ring-1 ring-white/10">+{showDelay}s</span>}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30">in: {entryAnim} {entryDur}s</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/30">out: {exitAnim} {exitDur}s</span>
      </div>

      {/* Card preview */}
      <div className={`absolute inset-0 z-10 flex ${POS_CLASS[position] ?? POS_CLASS.center} p-4`}>
        <div className={`w-full ${SIZE_CLASS[size] ?? 'max-w-xl'}`}>
          <PopupCard p={p} isEditor={true} />
        </div>
      </div>
    </div>
  )
}
