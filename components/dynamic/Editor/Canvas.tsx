'use client'

import React, { useState, Component } from 'react'
import { useDndContext, useDroppable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlockData } from '../types'
import { getCodeBlock } from '../BlockRegistry'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'

// ── Error boundary ─────────────────────────────────────────────────────────────

class BlockErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-16 text-xs text-error/50 border border-error/20 rounded m-2">
          Block render error
        </div>
      )
    }
    return this.props.children
  }
}

// ── Resize handle ─────────────────────────────────────────────────────────────

function ResizeHandle({ blockId }: { blockId: string }) {
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)
  const [dragging, setDragging] = useState(false)
  const [liveH, setLiveH] = useState(0)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

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
      {/* visible border line between blocks while dragging */}
      {dragging && (
        <div className="absolute inset-x-0 bottom-2.5 h-0.5 bg-primary/60" />
      )}
      <div className={[
        'relative flex items-center gap-1 px-2 py-0.5 rounded-t text-[10px] font-medium',
        dragging ? 'bg-primary text-primary-content' : 'bg-black/60 text-white/70',
      ].join(' ')}>
        <span>↕</span>
        {dragging ? `${Math.round(liveH)}px` : 'Resize'}
      </div>
    </div>
  )
}

// ── Insert gap (droppable zone between blocks) ────────────────────────────────

function InsertGap({ index }: { index: number }) {
  const { setNodeRef, isOver } = useDroppable({ id: `insert-gap-${index}` })
  const { active } = useDndContext()
  const isFromSidebar = active?.data.current?.fromSidebar ?? false

  if (!isFromSidebar) return null

  return (
    <div
      ref={setNodeRef}
      className={`mx-3 rounded-lg border-2 border-dashed transition-all duration-150 ${
        isOver
          ? 'h-10 border-primary bg-primary/10'
          : 'h-2 border-base-content/20'
      }`}
    />
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
  isTranslationMode?: boolean
}

function SortableBlock({ block, isSelected, onSelect, onDelete, onDuplicate, onToggleHidden, isTranslationMode }: SortableBlockProps) {
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
      className={`relative group cursor-pointer ${block.hidden ? 'opacity-40' : ''}`}
      onClick={onSelect}
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
        <span className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70">{label}</span>

        {!isTranslationMode && (
          <>
            <button
              className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); onToggleHidden() }}
              title={block.hidden ? 'Show block' : 'Hide block'}
            >
              {block.hidden ? '👁' : '🙈'}
            </button>

            <button
              className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70 hover:text-white transition-colors"
              onClick={(e) => { e.stopPropagation(); onDuplicate() }}
              title="Duplicate block"
            >
              ⧉
            </button>

            <div
              {...attributes}
              {...listeners}
              className="px-2 py-1 rounded text-xs font-medium cursor-grab active:cursor-grabbing bg-black/75 text-white/70"
              onClick={(e) => e.stopPropagation()}
              title="Drag to reorder"
            >
              ⠿
            </div>

            <button
              className="px-2 py-1 rounded text-xs font-medium bg-error/85 text-error-content"
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              title="Delete block"
            >
              ✕
            </button>
          </>
        )}
      </div>

      {/* block content */}
      <BlockErrorBoundary>
        {codeDef ? (
          <codeDef.Component {...block.props} />
        ) : (
          <TemplateBlockRenderer template={dbDef!.template} props={block.props} />
        )}
      </BlockErrorBoundary>

      {/* resize handle */}
      {!isTranslationMode && <ResizeHandle blockId={block.id} />}
    </div>
  )
}

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

  const maxWidth = PREVIEW_WIDTHS[previewMode] ?? '100%'
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  if (sections.length === 0) {
    return (
      <SidebarDropTarget>
        <div className="flex flex-col items-center justify-center py-40 gap-3">
          <div className="text-4xl opacity-20">+</div>
          <p className="text-sm text-base-content/30">Add blocks from the left panel to build your page.</p>
        </div>
      </SidebarDropTarget>
    )
  }

  return (
    <div
      className="mx-auto transition-all duration-300"
      style={{ maxWidth, width: '100%' }}
    >
      <InsertGap index={0} />
      {sorted.map((block, i) => (
        <React.Fragment key={block.id}>
          <SortableBlock
            block={block}
            isSelected={selectedId === block.id}
            onSelect={() => setSelectedId(block.id)}
            onDelete={() => deleteBlock(block.id)}
            onDuplicate={() => duplicateBlock(block.id)}
            onToggleHidden={() => toggleBlockHidden(block.id)}
            isTranslationMode={isTranslationMode}
          />
          <InsertGap index={i + 1} />
        </React.Fragment>
      ))}
    </div>
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
