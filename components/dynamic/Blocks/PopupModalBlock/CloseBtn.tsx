'use client'

import { CLOSE_POS_CLASS, CLOSE_SIZE } from './constants'
import type { CloseBtnProps } from './types'

export function CloseBtn({ pos, style, size, color, bgColor, isEditor, onClose }: CloseBtnProps) {
  if (pos === 'hidden') return null
  const posClass = CLOSE_POS_CLASS[pos] ?? 'top-2 right-2'
  const { box } = CLOSE_SIZE[size] ?? CLOSE_SIZE.md
  const shapeClass = style === 'circle' ? 'rounded-full' : style === 'square' ? 'rounded' : ''
  const hasBg = style !== 'minimal'

  const inner = (
    <span className={`absolute ${posClass} flex items-center justify-center ${box} ${shapeClass} leading-none transition-opacity hover:opacity-70`}
      style={{ color, backgroundColor: hasBg ? bgColor : 'transparent' }}>
      ×
    </span>
  )

  if (isEditor) return inner
  return (
    <button onClick={onClose} aria-label="Close"
      className={`absolute ${posClass} flex items-center justify-center ${box} ${shapeClass} leading-none transition-opacity hover:opacity-70 cursor-pointer`}
      style={{ color, backgroundColor: hasBg ? bgColor : 'transparent' }}>
      ×
    </button>
  )
}
