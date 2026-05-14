'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useDraggable, DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { getCodeBlocks, getCodeBlock } from '../BlockRegistry'
import type { BlockDefinition, DynamicPageBlockRecord } from '../types'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronLeft, faGripVertical, faEye, faEyeSlash, faTrash } from '@fortawesome/free-solid-svg-icons'

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
    <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5 text-base-content/30 transition-transform" style={{ transform: open ? 'rotate(90deg)' : 'rotate(0deg)' }} />
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

// ── Sortable layer item ───────────────────────────────────────────────────────

interface SortableLayerItemProps {
  block: { id: string; type: string; label?: string; hidden?: boolean; order: number }
  index: number
  isTranslationMode: boolean
  editingId: string | null
  editValue: string
  setEditingId: (id: string | null) => void
  setEditValue: (v: string) => void
}

function SortableLayerItem({ block, index, isTranslationMode, editingId, editValue, setEditingId, setEditValue }: SortableLayerItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `layer-${block.id}` })
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const toggleBlockHidden = useEditorStore((s) => s.toggleBlockHidden)
  const deleteBlock = useEditorStore((s) => s.deleteBlock)
  const updateBlockLabel = useEditorStore((s) => s.updateBlockLabel)
  const blockDefs = useEditorStore((s) => s.blockDefs)

  const codeDef = getCodeBlock(block.type)
  const dbDef = blockDefs.find((d) => d.type === block.type)
  const label = codeDef?.label ?? dbDef?.label ?? block.type
  const isSelected = selectedId === block.id

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => {
        setSelectedId(block.id)
        requestAnimationFrame(() => {
          document.querySelector(`[data-block-id="${block.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
      }}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors select-none group ${
        isSelected ? 'bg-primary/10 text-primary' : 'text-base-content/60 hover:bg-base-300 hover:text-base-content'
      } ${block.hidden ? 'opacity-40' : ''}`}
    >
      {!isTranslationMode && (
        <div
          {...attributes}
          {...listeners}
          className="w-4 flex-shrink-0 flex items-center justify-center cursor-grab active:cursor-grabbing text-base-content/20 hover:text-base-content/50 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <FontAwesomeIcon icon={faGripVertical} className="w-2.5 h-2.5" />
        </div>
      )}
      <span className="text-[10px] text-base-content/30 w-4 text-right flex-shrink-0 tabular-nums">{index + 1}</span>
      {editingId === block.id ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => { updateBlockLabel(block.id, editValue.trim()); setEditingId(null) }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { updateBlockLabel(block.id, editValue.trim()); setEditingId(null) }
            if (e.key === 'Escape') setEditingId(null)
          }}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs font-medium bg-base-200 border border-primary/40 rounded px-1 py-0 outline-none min-w-0"
        />
      ) : (
        <span
          className="flex-1 text-xs font-medium truncate"
          onDoubleClick={(e) => { e.stopPropagation(); setEditingId(block.id); setEditValue(block.label || label) }}
          title="Double-click to rename"
        >
          {block.label || label}
        </span>
      )}
      {!isTranslationMode && (
        <div
          className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => toggleBlockHidden(block.id)}
            className="w-5 h-5 flex items-center justify-center text-[11px] rounded hover:bg-base-content/10 transition-colors"
            title={block.hidden ? 'Show block' : 'Hide block'}
          >
            <FontAwesomeIcon icon={block.hidden ? faEye : faEyeSlash} className="w-3 h-3" />
          </button>
          <button
            onClick={() => deleteBlock(block.id)}
            className="w-5 h-5 flex items-center justify-center text-[11px] rounded text-error/50 hover:text-error hover:bg-error/10 transition-colors"
            title="Delete block"
          >
            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ── Layers panel ──────────────────────────────────────────────────────────────

function LayersPanel() {
  const sections = useEditorStore((s) => s.sections)
  const reorderBlocks = useEditorStore((s) => s.reorderBlocks)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  const handleLayerDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromId = (active.id as string).slice('layer-'.length)
    const toId = (over.id as string).slice('layer-'.length)
    reorderBlocks(fromId, toId)
  }

  if (sorted.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-base-content/30 text-center leading-relaxed">No blocks yet.<br />Add blocks from the Blocks tab.</p>
      </div>
    )
  }

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleLayerDragEnd}>
      <SortableContext items={sorted.map((b) => `layer-${b.id}`)} strategy={verticalListSortingStrategy}>
        <div className="py-2 px-2 space-y-0.5">
          {sorted.map((block, i) => (
            <SortableLayerItem
              key={block.id}
              block={block}
              index={i}
              isTranslationMode={isTranslationMode}
              editingId={editingId}
              editValue={editValue}
              setEditingId={setEditingId}
              setEditValue={setEditValue}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export default function LeftSidebar() {
  const rawAddBlock = useEditorStore((s) => s.addBlock)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const sections = useEditorStore((s) => s.sections)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
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
    setTimeout(() => {
      const newId = useEditorStore.getState().selectedId
      if (newId) {
        document.querySelector(`[data-block-id="${newId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, 60)
    setRecentlyUsed((prev) => {
      const next = [type, ...prev.filter((t) => t !== type)].slice(0, MAX_RECENT)
      try { localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [rawAddBlock])

  const allDefs: AnyBlockDef[] = useMemo(
    () => [...getCodeBlocks(), ...blockDefs],
    [blockDefs]
  )

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
    const y = e.currentTarget.getBoundingClientRect().top
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = setTimeout(() => setHovered({ def, y }), 150)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null }
    setHovered(null)
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
          <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
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
            <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
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
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${activeTab === 'layers' ? 'bg-base-100 text-base-content shadow-sm' : 'text-base-content/40 hover:text-base-content/70'}`}
          >
            Layers
            {sections.length > 0 && (
              <span className={`text-[9px] tabular-nums px-1 rounded-full ${activeTab === 'layers' ? 'bg-base-content/10 text-base-content/60' : 'bg-base-content/10 text-base-content/30'}`}>
                {sections.length}
              </span>
            )}
          </button>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
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
                      onMouseLeave={handleMouseLeave}
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
                          onMouseLeave={handleMouseLeave}
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
                            onMouseLeave={handleMouseLeave}
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
