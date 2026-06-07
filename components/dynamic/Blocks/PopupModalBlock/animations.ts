const KEYFRAMES = `
@keyframes pu-fade-in      { from{opacity:0}             to{opacity:1} }
@keyframes pu-fade-out     { from{opacity:1}             to{opacity:0} }
@keyframes pu-slide-up-in  { from{opacity:0;transform:translateY(48px)}  to{opacity:1;transform:translateY(0)} }
@keyframes pu-slide-up-out { from{opacity:1;transform:translateY(0)}    to{opacity:0;transform:translateY(-32px)} }
@keyframes pu-slide-dn-in  { from{opacity:0;transform:translateY(-48px)} to{opacity:1;transform:translateY(0)} }
@keyframes pu-slide-dn-out { from{opacity:1;transform:translateY(0)}    to{opacity:0;transform:translateY(32px)} }
@keyframes pu-slide-lt-in  { from{opacity:0;transform:translateX(48px)}  to{opacity:1;transform:translateX(0)} }
@keyframes pu-slide-lt-out { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(-32px)} }
@keyframes pu-slide-rt-in  { from{opacity:0;transform:translateX(-48px)} to{opacity:1;transform:translateX(0)} }
@keyframes pu-slide-rt-out { from{opacity:1;transform:translateX(0)}    to{opacity:0;transform:translateX(32px)} }
@keyframes pu-zoom-in      { from{opacity:0;transform:scale(0.82)}  to{opacity:1;transform:scale(1)} }
@keyframes pu-zoom-out     { from{opacity:1;transform:scale(1)}     to{opacity:0;transform:scale(0.82)} }
@keyframes pu-flip-in      { from{opacity:0;transform:perspective(600px) rotateX(-25deg)} to{opacity:1;transform:perspective(600px) rotateX(0)} }
@keyframes pu-flip-out     { from{opacity:1;transform:perspective(600px) rotateX(0)}      to{opacity:0;transform:perspective(600px) rotateX(25deg)} }
@keyframes pu-overlay-in   { from{opacity:0} to{opacity:1} }
@keyframes pu-overlay-out  { from{opacity:1} to{opacity:0} }
`

export function injectKeyframes() {
  if (typeof document === 'undefined' || document.getElementById('popup-modal-kf')) return
  const s = document.createElement('style')
  s.id = 'popup-modal-kf'
  s.textContent = KEYFRAMES
  document.head.appendChild(s)
}

export const ENTRY_DEF: Record<string, { kf: string; ease: string }> = {
  none: { kf: '', ease: '' },
  fade: { kf: 'pu-fade-in', ease: 'ease' },
  'slide-up': { kf: 'pu-slide-up-in', ease: 'cubic-bezier(.34,1.56,.64,1)' },
  'slide-down': { kf: 'pu-slide-dn-in', ease: 'ease' },
  'slide-left': { kf: 'pu-slide-lt-in', ease: 'ease' },
  'slide-right': { kf: 'pu-slide-rt-in', ease: 'ease' },
  zoom: { kf: 'pu-zoom-in', ease: 'cubic-bezier(.34,1.56,.64,1)' },
  flip: { kf: 'pu-flip-in', ease: 'ease' },
}

export const EXIT_DEF: Record<string, { kf: string; ease: string }> = {
  none: { kf: '', ease: '' },
  fade: { kf: 'pu-fade-out', ease: 'ease' },
  'slide-up': { kf: 'pu-slide-up-out', ease: 'ease' },
  'slide-down': { kf: 'pu-slide-dn-out', ease: 'ease' },
  'slide-left': { kf: 'pu-slide-lt-out', ease: 'ease' },
  'slide-right': { kf: 'pu-slide-rt-out', ease: 'ease' },
  zoom: { kf: 'pu-zoom-out', ease: 'ease' },
  flip: { kf: 'pu-flip-out', ease: 'ease' },
}

export function buildAnim(def: { kf: string; ease: string }, dur: number): string {
  if (!def.kf) return ''
  return `${def.kf} ${dur}s ${def.ease} forwards`
}
