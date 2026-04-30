'use client'

import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { getAllBlockDefinitions } from '../BlockRegistry'
import type { BlockDefinition } from '../types'

// Category display order — Custom is pinned first
const CATEGORY_ORDER = ['Custom', 'Hero', 'Content', 'Process', 'Trust & Social Proof', 'CTA']

// Preview: renders block at full 1280px width then scales to 320px thumbnail
const PREVIEW_WIDTH = 320
const INNER_WIDTH = 1280
const SCALE = PREVIEW_WIDTH / INNER_WIDTH
const PREVIEW_HEIGHT = 220

interface PreviewProps {
  def: BlockDefinition
  anchorY: number
  sidebarRight: number
}

function BlockPreview({ def, anchorY, sidebarRight }: PreviewProps) {
  const { Component, defaultProps } = def
  const maxTop = window.innerHeight - PREVIEW_HEIGHT - 8
  const top = Math.min(Math.max(anchorY, 8), maxTop)

  return createPortal(
    <div
      className="pointer-events-none"
      style={{
        position: 'fixed',
        top,
        left: sidebarRight + 8,
        width: PREVIEW_WIDTH,
        height: PREVIEW_HEIGHT,
        zIndex: 9999,
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        border: '1px solid oklch(var(--p) / 0.3)',
      }}
    >
      <div
        style={{
          width: INNER_WIDTH,
          transformOrigin: 'top left',
          transform: `scale(${SCALE})`,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <Component {...defaultProps} />
      </div>

      {/* Label gradient */}
      <div
        className="text-primary"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 10px 7px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.06em',
        }}
      >
        {def.label}
      </div>
    </div>,
    document.body
  )
}

// Chevron icon
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{
        transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
        transition: 'transform 150ms ease',
        flexShrink: 0,
      }}
    >
      <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface Props {
  onAdd: (type: string) => void
}

export default function Sidebar({ onAdd }: Props) {
  const defs = getAllBlockDefinitions()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [hovered, setHovered] = useState<{ def: BlockDefinition; y: number } | null>(null)

  // Build ordered category map
  const grouped = defs.reduce<Record<string, BlockDefinition[]>>((acc, def) => {
    const cat = def.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(def)
    return acc
  }, {})

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  // All categories open by default
  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(orderedCategories.map((c) => [c, true]))
  )

  const toggleCategory = (cat: string) =>
    setOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))

  const handleMouseEnter = useCallback(
    (def: BlockDefinition, e: React.MouseEvent<HTMLButtonElement>) => {
      setHovered({ def, y: e.currentTarget.getBoundingClientRect().top })
    },
    []
  )

  const sidebarRight = sidebarRef.current?.getBoundingClientRect().right ?? 240

  return (
    <div
      ref={sidebarRef}
      className="w-60 flex-shrink-0 flex flex-col border-r border-base-content/10 overflow-y-auto bg-base-200"
    >
      <div className="px-4 py-3 border-b border-base-content/10">
        <p className="text-xs font-semibold tracking-widest text-base-content/40">
          BLOCKS
        </p>
      </div>

      <div className="py-2">
        {orderedCategories.map((cat) => (
          <div key={cat}>
            {/* Category header */}
            <button
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-2 transition-colors text-base-content/50"
            >
              <span className="text-xs font-semibold uppercase tracking-widest">{cat}</span>
              <Chevron open={open[cat] ?? true} />
            </button>

            {/* Block list */}
            {(open[cat] ?? true) && (
              <div className="px-3 pb-2 space-y-1.5">
                {grouped[cat].map((def) => {
                  const isCustom = cat === 'Custom'
                  const isHovered = hovered?.def.type === def.type
                  return (
                    <button
                      key={def.type}
                      onClick={() => onAdd(def.type)}
                      onMouseEnter={(e) => handleMouseEnter(def, e)}
                      onMouseLeave={() => setHovered(null)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all hover:scale-[1.02] border ${
                        isCustom
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-base-300 border-base-content/10'
                      } ${isHovered ? 'border-primary/50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-0.5 ${isCustom ? 'text-primary' : 'text-base-content'}`}>
                        {def.label}
                      </div>
                      <div className="text-xs leading-snug text-base-content/40">
                        {def.description}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {hovered && (
        <BlockPreview
          def={hovered.def}
          anchorY={hovered.y}
          sidebarRight={sidebarRight}
        />
      )}
    </div>
  )
}
