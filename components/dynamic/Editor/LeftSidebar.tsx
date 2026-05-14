'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { getCodeBlocks, getCodeBlock } from '../BlockRegistry'
import type { BlockDefinition, DynamicPageBlockRecord } from '../types'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'

type AnyBlockDef = BlockDefinition | DynamicPageBlockRecord

const CATEGORY_ORDER = ['Custom', 'General', 'Hero', 'Content', 'CTA']
const RECENTLY_USED_KEY = 'dynamic_editor_recently_used'
const MAX_RECENT = 5

const PREVIEW_WIDTH = 320
const INNER_WIDTH = 1280
const SCALE = PREVIEW_WIDTH / INNER_WIDTH
const PREVIEW_HEIGHT = 220

// ── Block hover preview ───────────────────────────────────────────────────────

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

// ── Chevron ───────────────────────────────────────────────────────────────────

function Chevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 150ms ease', flexShrink: 0 }}>
      <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Draggable block button ────────────────────────────────────────────────────

function DraggableBlockButton({ def, onAdd, onMouseEnter, onMouseLeave, isHovered }: {
  def: AnyBlockDef
  onAdd: () => void
  onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => void
  onMouseLeave: () => void
  isHovered: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `sidebar-${def.type}`,
    data: { fromSidebar: true, blockType: def.type, blockLabel: def.label },
  })
  const isCustom = def.category === 'Custom'
  const icon = 'icon' in def ? def.icon : undefined

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onAdd}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ opacity: isDragging ? 0.4 : 1, touchAction: 'none' }}
      className={`w-full text-left p-2.5 rounded-lg transition-all hover:scale-[1.02] border cursor-grab active:cursor-grabbing select-none ${
        isCustom ? 'bg-primary/5 border-primary/20' : 'bg-base-300 border-base-content/10'
      } ${isHovered ? 'border-primary/50' : ''}`}
    >
      <div className={`flex items-center gap-1.5 text-sm font-medium mb-0.5 ${isCustom ? 'text-primary' : 'text-base-content'}`}>
        {icon && <span className="text-base leading-none">{icon}</span>}
        {def.label}
      </div>
      <div className="text-xs leading-snug text-base-content/40">{'description' in def ? def.description : ''}</div>
    </button>
  )
}

// ── Layers panel ──────────────────────────────────────────────────────────────

function LayersPanel() {
  const sections = useEditorStore((s) => s.sections)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const toggleBlockHidden = useEditorStore((s) => s.toggleBlockHidden)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-base-content/30 text-center leading-relaxed">No blocks yet.<br />Add blocks from the Blocks tab.</p>
      </div>
    )
  }

  return (
    <div className="py-2 px-2 space-y-0.5">
      {sorted.map((block, i) => {
        const codeDef = getCodeBlock(block.type)
        const dbDef = blockDefs.find((d) => d.type === block.type)
        const label = codeDef?.label ?? dbDef?.label ?? block.type
        const isSelected = selectedId === block.id

        return (
          <div
            key={block.id}
            onClick={() => setSelectedId(block.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none group ${
              isSelected ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
            } ${block.hidden ? 'opacity-40' : ''}`}
          >
            <span className="text-[10px] text-base-content/30 w-4 text-right flex-shrink-0 tabular-nums">{i + 1}</span>
            <span className="flex-1 text-xs font-medium truncate">{label}</span>

            {!isTranslationMode && (
              <div
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => moveBlock(block.id, -1)}
                  disabled={i === 0}
                  className="w-5 h-5 flex items-center justify-center text-[11px] rounded hover:bg-base-content/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >↑</button>
                <button
                  onClick={() => moveBlock(block.id, 1)}
                  disabled={i === sorted.length - 1}
                  className="w-5 h-5 flex items-center justify-center text-[11px] rounded hover:bg-base-content/10 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >↓</button>
                <button
                  onClick={() => toggleBlockHidden(block.id)}
                  className="w-5 h-5 flex items-center justify-center text-[11px] rounded hover:bg-base-content/10 transition-colors"
                  title={block.hidden ? 'Show block' : 'Hide block'}
                >
                  {block.hidden ? '👁' : '🙈'}
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function LeftSidebar() {
  const rawAddBlock = useEditorStore((s) => s.addBlock)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState<{ def: AnyBlockDef; y: number } | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'blocks' | 'layers'>('blocks')
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_USED_KEY)
      if (raw) setRecentlyUsed(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const addBlock = useCallback((type: string) => {
    rawAddBlock(type)
    setRecentlyUsed((prev) => {
      const next = [type, ...prev.filter((t) => t !== type)].slice(0, MAX_RECENT)
      try { localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [rawAddBlock])

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

  const searchTrimmed = search.trim()
  const isSearchActive = searchTrimmed.length > 0
  const filteredDefs = isSearchActive
    ? allDefs.filter((def) => {
        const q = searchTrimmed.toLowerCase()
        if (def.label.toLowerCase().includes(q)) return true
        const tags = 'tags' in def ? (def.tags ?? []) : []
        return tags.some((t: string) => t.toLowerCase().includes(q))
      })
    : []

  const recentDefs = recentlyUsed
    .map((type) => allDefs.find((d) => d.type === type))
    .filter(Boolean) as AnyBlockDef[]

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
          <button onClick={() => setCollapsed(true)} title="Collapse" className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2.5L4.5 6L8 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
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
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-content/10 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1 bg-base-300 rounded-md p-0.5">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'blocks' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}
          >
            Blocks
          </button>
          <button
            onClick={() => setActiveTab('layers')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${activeTab === 'layers' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}
          >
            Layers
          </button>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2.5L4.5 6L8 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Layers tab */}
      {activeTab === 'layers' && <LayersPanel />}

      {/* Blocks tab */}
      {activeTab === 'blocks' && (
        <>
          <div className="px-3 pt-2 pb-1 flex-shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blocks…"
                className="w-full text-xs bg-base-300 border border-base-content/10 rounded-md px-2.5 py-1.5 pr-6 text-base-content placeholder:text-base-content/30 focus:outline-none focus:border-primary/40 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-1.5 text-base-content/40 hover:text-base-content transition-colors leading-none" title="Clear">×</button>
              )}
            </div>
          </div>

          <div className="py-2 flex-1">
            {isSearchActive ? (
              filteredDefs.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-xs text-base-content/30">No blocks found</p>
                </div>
              ) : (
                <div className="px-3 pb-2 space-y-1.5">
                  {filteredDefs.map((def) => (
                    <DraggableBlockButton
                      key={def.type}
                      def={def}
                      onAdd={() => addBlock(def.type)}
                      onMouseEnter={(e) => handleMouseEnter(def, e)}
                      onMouseLeave={() => setHovered(null)}
                      isHovered={hovered?.def.type === def.type}
                    />
                  ))}
                </div>
              )
            ) : (
              <>
                {/* Recently used */}
                {recentDefs.length > 0 && (
                  <div className="mb-1">
                    <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-base-content/30">Recently Used</p>
                    <div className="px-3 pb-2 space-y-1.5">
                      {recentDefs.map((def) => (
                        <DraggableBlockButton
                          key={`recent-${def.type}`}
                          def={def}
                          onAdd={() => addBlock(def.type)}
                          onMouseEnter={(e) => handleMouseEnter(def, e)}
                          onMouseLeave={() => setHovered(null)}
                          isHovered={hovered?.def.type === def.type}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Categorised blocks */}
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
                        {grouped[cat].map((def) => (
                          <DraggableBlockButton
                            key={def.type}
                            def={def}
                            onAdd={() => addBlock(def.type)}
                            onMouseEnter={(e) => handleMouseEnter(def, e)}
                            onMouseLeave={() => setHovered(null)}
                            isHovered={hovered?.def.type === def.type}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      )}

      {hovered && activeTab === 'blocks' && (
        <BlockPreview def={hovered.def} anchorY={hovered.y} sidebarRight={sidebarRight} />
      )}
    </div>
  )
}
