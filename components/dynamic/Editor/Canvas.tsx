'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlockData } from '../types'
import { getCodeBlock, getCodeBlocks } from '../BlockRegistry'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'
import { BlockEditorErrorBoundary } from '../BlockErrorBoundary'
import { PreviewContext } from '../PreviewContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUpDown, faEye, faEyeSlash, faClone, faGripVertical, faTrash } from '@fortawesome/free-solid-svg-icons'

// ── Resize handle ─────────────────────────────────────────────────────────────

function ResizeHandle({ blockId }: { blockId: string }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)
  const snapshotForUndo = useEditorStore((s) => s.snapshotForUndo)
  const [dragging, setDragging] = useState(false)
  const [liveH, setLiveH] = useState(0)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    // Snapshot before resize so Ctrl+Z can revert it
    snapshotForUndo()

    const container = (e.currentTarget as HTMLElement).parentElement!
    const startY = e.clientY
    const startH = container.offsetHeight

    setDragging(true)
    setLiveH(startH)

    const onMove = (ev: MouseEvent) => {
      const newH = Math.max(80, startH + (ev.clientY - startY))
      setLiveH(newH)
      const block = useEditorStore.getState().sections.find((b) => b.id === blockId)
      if (block) updateBlockProps(blockId, { ...block.props, blockHeight: Math.round(newH) })
    }

    const onUp = () => {
      setDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  return (
    <div
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-0 left-0 right-0 z-30 h-5 flex items-end justify-center pb-0.5 cursor-ns-resize select-none opacity-0 group-hover:opacity-100 transition-opacity"
    >
      {dragging && (
        <div className="absolute inset-x-0 bottom-2.5 h-0.5 bg-primary/60" />
      )}
      <div className={[
        'relative flex items-center gap-1 px-2 py-0.5 rounded-t text-[10px] font-medium',
        dragging ? 'bg-primary text-primary-content' : 'bg-black/60 text-white/70',
      ].join(' ')}>
        <FontAwesomeIcon icon={faUpDown} className="w-2.5 h-2.5" />
        {dragging ? `${Math.round(liveH)}px` : 'Resize'}
      </div>
    </div>
  )
}

// ── Quick Add Popover ─────────────────────────────────────────────────────────

interface QuickAddPopoverProps {
  index: number
  x: number
  y: number
  onClose: () => void
}

function QuickAddPopover({ index, x, y, onClose }: QuickAddPopoverProps) {
  const addBlock = useEditorStore((s) => s.addBlock)
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const popoverW = 208
  const popoverH = 280
  const margin = 8
  const left = Math.min(Math.max(x, margin), window.innerWidth - popoverW - margin)
  const top = Math.min(Math.max(y, margin), window.innerHeight - popoverH - margin)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const allDefs = [...getCodeBlocks(), ...blockDefs]
  const q = search.trim().toLowerCase()
  const filtered = q
    ? allDefs.filter((d) => {
        if (d.label.toLowerCase().includes(q)) return true
        const tags = 'tags' in d ? (d.tags ?? []) : []
        return tags.some((t: string) => t.toLowerCase().includes(q))
      })
    : allDefs

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-base-100 border border-base-content/10 rounded-xl shadow-2xl p-2 w-52"
      style={{ top, left }}
    >
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search blocks…"
        className="text-xs bg-base-200 border border-base-content/10 rounded-lg px-2.5 py-1.5 mb-2 w-full outline-none focus:border-primary/40"
      />
      <div className="max-h-52 overflow-y-auto space-y-0.5">
        {filtered.length === 0 ? (
          <p className="text-xs text-center py-2 text-base-content/30">No blocks found</p>
        ) : (
          filtered.map((def) => (
            <button
              key={def.type}
              className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-base-200 transition-colors text-base-content flex items-center gap-1.5"
              onClick={() => { addBlock(def.type, index); onClose() }}
            >
              {'icon' in def && def.icon ? <span>{def.icon as React.ReactNode}</span> : null}
              {def.label}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Block Context Menu ────────────────────────────────────────────────────────

interface BlockContextMenuProps {
  blockId: string
  x: number
  y: number
  onClose: () => void
}

function BlockContextMenu({ blockId, x, y, onClose }: BlockContextMenuProps) {
  const deleteBlock = useEditorStore((s) => s.deleteBlock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const copyBlock = useEditorStore((s) => s.copyBlock)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const toggleBlockHidden = useEditorStore((s) => s.toggleBlockHidden)
  const sections = useEditorStore((s) => s.sections)
  const block = sections.find((b) => b.id === blockId)

  const ref = useRef<HTMLDivElement>(null)

  const menuW = 176
  const menuH = 200
  const margin = 8
  const left = Math.min(Math.max(x, margin), window.innerWidth - menuW - margin)
  const top = Math.min(Math.max(y, margin), window.innerHeight - menuH - margin)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const rowCls = 'w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-base-200 transition-colors text-base-content'
  const hintCls = 'text-base-content/25 text-[10px] ml-auto'

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-base-100 border border-base-content/10 rounded-xl shadow-2xl py-1 w-44"
      style={{ top, left }}
    >
      <button className={rowCls} onClick={() => { duplicateBlock(blockId); onClose() }}>
        Duplicate <span className={hintCls}>Ctrl+D</span>
      </button>
      <button className={rowCls} onClick={() => { copyBlock(blockId); onClose() }}>
        Copy <span className={hintCls}>Ctrl+C</span>
      </button>
      <button className={rowCls} onClick={() => { toggleBlockHidden(blockId); onClose() }}>
        {block?.hidden ? 'Show' : 'Hide'}
      </button>
      <button className={rowCls} onClick={() => { moveBlock(blockId, -1); onClose() }}>Move Up</button>
      <button className={rowCls} onClick={() => { moveBlock(blockId, 1); onClose() }}>Move Down</button>
      <div className="my-1 border-t border-base-content/10" />
      <button
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-base-200 transition-colors text-error"
        onClick={() => { deleteBlock(blockId); onClose() }}
      >
        Delete <span className={hintCls}>⌫</span>
      </button>
    </div>
  )
}

// ── Insert gap (droppable zone between blocks) ────────────────────────────────

interface InsertGapProps {
  index: number
  onQuickAdd: (index: number, x: number, y: number) => void
}

function InsertGap({ index, onQuickAdd }: InsertGapProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `insert-gap-${index}` })
  const { active } = useDndContext()
  const isFromSidebar = active?.data.current?.fromSidebar ?? false
  const [hovered, setHovered] = useState(false)

  if (isFromSidebar) {
    return (
      <div
        ref={setNodeRef}
        className={`mx-3 rounded-lg border-2 border-dashed transition-all duration-150 ${
          isOver ? 'h-10 border-primary bg-primary/10' : 'h-2 border-base-content/20'
        }`}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      className="relative h-5 flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <>
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-primary/20" />
          <button
            className="absolute z-20 flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-primary-content shadow hover:scale-105 transition-transform select-none"
            onClick={(e) => { e.stopPropagation(); onQuickAdd(index, e.clientX, e.clientY) }}
          >
            +
          </button>
        </>
      )}
    </div>
  )
}

// ── Sortable block ─────────────────────────────────────────────────────────────

interface SortableBlockProps {
  block: BlockData
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleHidden: () => void
  onContextMenu: (e: React.MouseEvent, blockId: string) => void
  isTranslationMode?: boolean
}

const SortableBlock = memo(
  function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onToggleHidden, onContextMenu, isTranslationMode }: SortableBlockProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
    const blockDefs = useEditorStore((s) => s.blockDefs)

    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

    const codeDef = getCodeBlock(block.type)
    const dbDef = blockDefs.find((d) => d.type === block.type)
    const label = codeDef?.label ?? dbDef?.label ?? block.type

    if (!codeDef && !dbDef) return null

    return (
      <div
        ref={setNodeRef}
        style={style}
        data-block-id={block.id}
        className={`relative group cursor-pointer ${block.hidden ? 'opacity-40' : ''}`}
        onClick={onSelect}
        onContextMenu={(e) => { e.preventDefault(); onContextMenu(e, block.id) }}
      >
        {/* selection outline */}
        <div
          className="absolute inset-0 z-10 pointer-events-none transition-all"
          style={{
            outline: isSelected ? '2px solid oklch(var(--p))' : '2px solid transparent',
            outlineOffset: '-2px',
          }}
        />

        {/* hidden overlay */}
        {block.hidden && (
          <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
            <span className="bg-black/60 text-white/70 text-[10px] font-semibold px-2 py-0.5 rounded">HIDDEN</span>
          </div>
        )}

        {/* controls */}
        <div className={`absolute top-2 right-2 z-20 flex items-center gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <span className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70">{block.label || label}</span>

          {!isTranslationMode && (
            <>
              <button
                className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); onToggleHidden() }}
                title={block.hidden ? 'Show block' : 'Hide block'}
              >
                <FontAwesomeIcon icon={block.hidden ? faEye : faEyeSlash} className="w-3 h-3" />
              </button>

              <button
                className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); onDuplicate() }}
                title="Duplicate block"
              >
                <FontAwesomeIcon icon={faClone} className="w-3 h-3" />
              </button>

              <div
                {...attributes}
                {...listeners}
                className="px-2 py-1 rounded text-xs font-medium cursor-grab active:cursor-grabbing bg-black/75 text-white/70"
                onClick={(e) => e.stopPropagation()}
                title="Drag to reorder"
              >
                <FontAwesomeIcon icon={faGripVertical} className="w-3 h-3" />
              </div>

              <button
                className="px-2 py-1 rounded text-xs font-medium bg-error/85 text-error-content"
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                title="Delete block"
              >
                <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* block content */}
        <BlockEditorErrorBoundary blockId={block.id} onDelete={onDelete}>
          {codeDef ? (
            <codeDef.Component {...block.props} />
          ) : (
            <TemplateBlockRenderer template={dbDef!.template} props={block.props} />
          )}
        </BlockEditorErrorBoundary>

        {/* resize handle */}
        {!isTranslationMode && <ResizeHandle blockId={block.id} />}
      </div>
    )
  },
  (prev, next) =>
    prev.block === next.block &&
    prev.isSelected === next.isSelected &&
    prev.isTranslationMode === next.isTranslationMode
)

// ── Canvas ────────────────────────────────────────────────────────────────────

const PREVIEW_WIDTHS: Record<string, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
}

export default function Canvas() {
  const sections = useEditorStore((s) => s.sections)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const deleteBlock = useEditorStore((s) => s.deleteBlock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const toggleBlockHidden = useEditorStore((s) => s.toggleBlockHidden)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')
  const previewMode = useEditorStore((s) => s.previewMode)
  const pendingDraft = useEditorStore((s) => s.pendingDraft)
  const restoreDraft = useEditorStore((s) => s.restoreDraft)
  const dismissDraft = useEditorStore((s) => s.dismissDraft)

  const [quickAdd, setQuickAdd] = useState<{ index: number; x: number; y: number } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ blockId: string; x: number; y: number } | null>(null)

  const maxWidth = PREVIEW_WIDTHS[previewMode] ?? '100%'
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const cur = useEditorStore.getState()
        const sortedNow = [...cur.sections].sort((a, b) => a.order - b.order)
        const idx = sortedNow.findIndex((b) => b.id === selectedId)
        const nextIdx = e.key === 'ArrowDown' ? idx + 1 : idx - 1
        if (nextIdx >= 0 && nextIdx < sortedNow.length) {
          const nextId = sortedNow[nextIdx].id
          setSelectedId(nextId)
          requestAnimationFrame(() => {
            document.querySelector(`[data-block-id="${nextId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          })
        }
      } else if (e.key === 'Escape') {
        setSelectedId(null)
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTranslationMode) {
        e.preventDefault()
        deleteBlock(selectedId)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [selectedId, setSelectedId, deleteBlock, isTranslationMode])

  const draftBanner = pendingDraft ? (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-4 bg-warning/90 px-4 py-2 text-xs text-warning-content backdrop-blur-sm">
      <span>
        Unsaved draft from{' '}
        <span className="font-semibold">{new Date(pendingDraft.savedAt).toLocaleTimeString()}</span>
        {pendingDraft.title ? ` — "${pendingDraft.title}"` : ''}
      </span>
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={restoreDraft} className="font-semibold underline underline-offset-2">
          Restore
        </button>
        <button onClick={dismissDraft} className="opacity-70 hover:opacity-100 transition-opacity">
          Dismiss
        </button>
      </div>
    </div>
  ) : null

  if (sections.length === 0) {
    return (
      <>
        {draftBanner}
        <SidebarDropTarget>
          <div className="flex flex-col items-center justify-center py-40 gap-3">
            <div className="text-4xl opacity-20">+</div>
            <p className="text-sm text-base-content/30">Add blocks from the left panel to build your page.</p>
          </div>
        </SidebarDropTarget>
      </>
    )
  }

  const isConstrained = previewMode !== 'desktop'

  return (
    <>
      {draftBanner}
      <PreviewContext.Provider value={previewMode}>
        <div className={`transition-colors duration-300 ${isConstrained ? 'min-h-full bg-base-300/70 py-6' : ''}`}>
          <div
            className={`transition-all duration-300 ${isConstrained ? 'mx-auto shadow-2xl ring-1 ring-base-content/10 bg-base-100' : ''}`}
            style={{ maxWidth, width: '100%' }}
          >
            <InsertGap index={0} onQuickAdd={(idx, x, y) => setQuickAdd({ index: idx, x, y })} />
            {sorted.map((block, i) => (
              <React.Fragment key={block.id}>
                <SortableBlock
                  block={block}
                  isSelected={selectedId === block.id}
                  onSelect={() => setSelectedId(block.id)}
                  onDelete={() => deleteBlock(block.id)}
                  onDuplicate={() => duplicateBlock(block.id)}
                  onToggleHidden={() => toggleBlockHidden(block.id)}
                  onContextMenu={(e, id) => setContextMenu({ blockId: id, x: e.clientX, y: e.clientY })}
                  isTranslationMode={isTranslationMode}
                />
                <InsertGap index={i + 1} onQuickAdd={(idx, x, y) => setQuickAdd({ index: idx, x, y })} />
              </React.Fragment>
            ))}
          </div>
        </div>
      </PreviewContext.Provider>

      {quickAdd && (
        <QuickAddPopover
          index={quickAdd.index}
          x={quickAdd.x}
          y={quickAdd.y}
          onClose={() => setQuickAdd(null)}
        />
      )}
      {contextMenu && (
        <BlockContextMenu
          blockId={contextMenu.blockId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}

// Droppable wrapper for the empty state
function SidebarDropTarget({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'insert-gap-0' })
  const { active } = useDndContext()
  const isFromSidebar = active?.data.current?.fromSidebar ?? false

  return (
    <div
      ref={setNodeRef}
      className={`min-h-full transition-all duration-150 ${isFromSidebar && isOver ? 'bg-primary/5 ring-2 ring-primary/30 ring-inset' : ''}`}
    >
      {children}
    </div>
  )
}
