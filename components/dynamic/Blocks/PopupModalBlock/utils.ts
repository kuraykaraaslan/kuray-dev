import type { PopupButton } from './types'

export function parseButtons(raw: unknown): PopupButton[] {
  if (Array.isArray(raw)) return raw as PopupButton[]
  if (typeof raw === 'string') { try { return JSON.parse(raw) } catch { } }
  return []
}

export function getStorage(frequency: string): Storage | null {
  if (typeof window === 'undefined') return null
  return frequency === 'SESSION' ? sessionStorage : localStorage
}

export function hasSeen(id: string, freq: string) {
  try { return getStorage(freq)?.getItem(`popup_seen_${id}`) === '1' } catch { return false }
}

export function markSeen(id: string, freq: string) {
  try { getStorage(freq)?.setItem(`popup_seen_${id}`, '1') } catch { }
}

export function matchesDevice(visibleOn: string): boolean {
  if (typeof window === 'undefined' || visibleOn === 'all') return true
  const w = window.innerWidth
  if (visibleOn === 'mobile') return w < 768
  if (visibleOn === 'tablet') return w >= 768 && w < 1024
  if (visibleOn === 'desktop') return w >= 1024
  if (visibleOn === 'mobile-tablet') return w < 1024
  if (visibleOn === 'tablet-desktop') return w >= 768
  return true
}
