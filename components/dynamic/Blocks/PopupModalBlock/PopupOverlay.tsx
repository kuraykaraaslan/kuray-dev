'use client'

import { useEffect, useState } from 'react'
import { POS_CLASS, SIZE_CLASS } from './constants'
import { ENTRY_DEF, EXIT_DEF, buildAnim, injectKeyframes } from './animations'
import { hasSeen, markSeen, matchesDevice } from './utils'
import { PopupCard } from './PopupCard'
import type { AnimPhase } from './types'

export function PopupOverlay({ rawProps: p }: { rawProps: Record<string, unknown> }) {
  const [phase, setPhase] = useState<AnimPhase | null>(null)

  const id = (p.__blockId as string) ?? 'popup'
  const frequency = (p.frequency as string) || 'EVERY_TIME'
  const showDelay = typeof p.showDelay === 'number' ? p.showDelay : 0
  const entryAnim = (p.entryAnimation as string) || 'zoom'
  const exitAnim = (p.exitAnimation as string) || 'fade'
  const entryDur = typeof p.entryDuration === 'number' ? Math.min(p.entryDuration, 5) : 0.35
  const exitDur = typeof p.exitDuration === 'number' ? Math.min(p.exitDuration, 5) : 0.22
  const opacity = typeof p.overlayOpacity === 'number' ? p.overlayOpacity / 100 : 0.65
  const position = (p.position as string) || 'center'
  const size = (p.size as string) || 'md'
  const visibleOn = (p.visibleOn as string) || 'all'

  const now = new Date()
  const sd = p.startDate as string | undefined
  const ed = p.endDate as string | undefined
  if (sd?.trim() && new Date(sd) > now) return null
  if (ed?.trim() && new Date(ed) < now) return null

  useEffect(() => {
    injectKeyframes()
    if (p.isActive === false) return
    if (!matchesDevice(visibleOn)) return
    if (frequency !== 'EVERY_TIME' && hasSeen(id, frequency)) return
    const t = setTimeout(() => setPhase(entryAnim === 'none' ? 'visible' : 'entering'), showDelay * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!phase || p.isActive === false) return null

  const close = () => {
    if (exitAnim === 'none') { if (frequency !== 'EVERY_TIME') markSeen(id, frequency); setPhase(null); return }
    setPhase('exiting')
  }

  const handleAnimEnd = () => {
    if (phase === 'entering') setPhase('visible')
    if (phase === 'exiting') { if (frequency !== 'EVERY_TIME') markSeen(id, frequency); setPhase(null) }
  }

  const overlayAnim = phase === 'entering'
    ? `pu-overlay-in ${entryDur}s ease forwards`
    : phase === 'exiting'
      ? `pu-overlay-out ${exitDur}s ease forwards`
      : undefined

  const cardAnim = phase === 'entering'
    ? buildAnim(ENTRY_DEF[entryAnim] ?? ENTRY_DEF.fade, entryDur)
    : phase === 'exiting'
      ? buildAnim(EXIT_DEF[exitAnim] ?? EXIT_DEF.fade, exitDur)
      : undefined

  return (
    <div
      className={`fixed inset-0 z-[9999] flex ${POS_CLASS[position] ?? POS_CLASS.center} p-4`}
      style={{ backgroundColor: `rgba(0,0,0,${opacity})`, animation: overlayAnim }}
      onClick={close}
    >
      <div className={`relative w-full ${SIZE_CLASS[size] ?? 'max-w-xl'}`} onClick={e => e.stopPropagation()}>
        <PopupCard
          p={p} isEditor={false} onClose={close}
          animStyle={cardAnim ? { animation: cardAnim } : undefined}
          onAnimEnd={handleAnimEnd}
        />
      </div>
    </div>
  )
}
