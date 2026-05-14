'use client'

import { useState, useRef, useCallback } from 'react'
import { getCodeBlocks } from '../BlockRegistry'
import type { BlockDefinition, DynamicPageBlockRecord } from '../types'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'

type AnyBlockDef = BlockDefinition | DynamicPageBlockRecord

const CATEGORY_ORDER = ['Custom', 'General', 'Hero', 'Content', 'CTA']

const PREVIEW_WIDTH = 320
const INNER_WIDTH = 1280
const SCALE = PREVIEW_WIDTH / INNER_WIDTH
const PREVIEW_HEIGHT = 220

function BlockPreview({ def, anchorY, sidebarRight }: { def: AnyBlockDef; anchorY: number; sidebarRight: number }) {
  const maxTop = window.innerHeight - PREVIEW_HEIGHT - 8
  const top = Math.min(Math.max(anchorY, 8), maxTop)

  const inner = 'Component' in def
    ? <def.Component {...def.defaultProps} />
    : <TemplateBlockRenderer template={def.template} props={def.defaultProps} />

  return (
    <div
      className="pointer-events-none bg-base-100/90 backdrop-blur-sm border-base-content/20"
      style={{ position: 'fixed', top, left: sidebarRight + 8, width: PREVIEW_WIDTH, height: PREVIEW_HEIGHT, zIndex: 50, borderRadius: 8, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', border: '1px solid oklch(var(--p) / 0.3)' }}
    >
      <div style={{ width: INNER_WIDTH, transformOrigin: 'top left', transform: `scale(${SCALE})`, pointerEvents: 'none', userSelect: 'none' }}>
        {inner}
      </div>
      <div className="text-primary" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 10px 7px', background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
        {def.label}
      </div>
    </div>
  )
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease', flexShrink: 0 }}>
      <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LeftSidebar() {
  const addBlock = useEditorStore((s) => s.addBlock)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<{ def: AnyBlockDef; y: number } | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  const allDefs: AnyBlockDef[] = [...getCodeBlocks(), ...blockDefs]

  const grouped = allDefs.reduce<Record<string, AnyBlockDef[]>>((acc, def) => {
    const cat = def.category ?? 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(def)
    return acc
  }, {})

  const orderedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !CATEGORY_ORDER.includes(c)),
  ]

  const [open, setOpen] = useState<Record<string, boolean>>(
    () => Object.fromEntries(orderedCategories.map((c) => [c, true]))
  )

  const handleMouseEnter = useCallback((def: AnyBlockDef, e: React.MouseEvent<HTMLButtonElement>) => {
    setHovered({ def, y: e.currentTarget.getBoundingClientRect().top })
  }, [])

  const sidebarRight = sidebarRef.current?.getBoundingClientRect().right ?? 240

  if (collapsed) {
    return (
      <div className="w-10 flex-shrink-0 flex flex-col border-r border-base-content/10 bg-base-200 items-center py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand blocks panel"
          className="w-7 h-7 flex items-center justify-center rounded-md text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex-1 flex items-center">
          <span className="text-[9px] font-semibold tracking-widest text-base-content/25 uppercase" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Blocks</span>
        </div>
      </div>
    )
  }

  if (isTranslationMode) {
    return (
      <div className="w-60 flex-shrink-0 flex flex-col border-r border-base-content/10 bg-base-200">
        <div className="px-4 py-3 border-b border-base-content/10 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest text-base-content/40">BLOCKS</p>
          <button
            onClick={() => setCollapsed(true)}
            title="Collapse blocks panel"
            className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2.5L4.5 6L8 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-base-content/30 text-center leading-relaxed">
            Block structure is locked in translation mode.<br />Only text content can be edited.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div ref={sidebarRef} className="w-60 flex-shrink-0 flex flex-col border-r border-base-content/10 overflow-y-auto bg-base-200">
      <div className="px-4 py-3 border-b border-base-content/10 flex items-center justify-between">
        <p className="text-xs font-semibold tracking-widest text-base-content/40">BLOCKS</p>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse blocks panel"
          className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M8 2.5L4.5 6L8 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="py-2">
        {orderedCategories.map((cat) => (
          <div key={cat}>
            <button
              onClick={() => setOpen((prev) => ({ ...prev, [cat]: !prev[cat] }))}
              className="w-full flex items-center justify-between px-4 py-2 transition-colors text-base-content/50"
            >
              <span className="text-xs font-semibold uppercase tracking-widest">{cat}</span>
              <Chevron open={open[cat] ?? true} />
            </button>

            {(open[cat] ?? true) && (
              <div className="px-3 pb-2 space-y-1.5">
                {grouped[cat].map((def) => {
                  const isCustom = cat === 'Custom'
                  const type = def.type
                  return (
                    <button
                      key={type}
                      onClick={() => addBlock(type)}
                      onMouseEnter={(e) => handleMouseEnter(def, e)}
                      onMouseLeave={() => setHovered(null)}
                      className={`w-full text-left p-2.5 rounded-lg transition-all hover:scale-[1.02] border ${isCustom ? 'bg-primary/5 border-primary/20' : 'bg-base-300 border-base-content/10'} ${hovered?.def.type === type ? 'border-primary/50' : ''}`}
                    >
                      <div className={`text-sm font-medium mb-0.5 ${isCustom ? 'text-primary' : 'text-base-content'}`}>{def.label}</div>
                      <div className="text-xs leading-snug text-base-content/40">{'description' in def ? def.description : ''}</div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {hovered && <BlockPreview def={hovered.def} anchorY={hovered.y} sidebarRight={sidebarRight} />}
    </div>
  )
}
