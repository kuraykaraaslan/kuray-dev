'use client'

import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlockData } from '../types'
import { getCodeBlock } from '../BlockRegistry'
import { useEditorStore } from './stores/editorStore'
import TemplateBlockRenderer from '../TemplateBlockRenderer'

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
      <div className={[
        'flex items-center gap-1 px-2 py-0.5 rounded-t text-[10px] font-medium',
        dragging ? 'bg-primary text-primary-content' : 'bg-black/60 text-white/70',
      ].join(' ')}>
        <span>↕</span>
        {dragging ? `${Math.round(liveH)}px` : 'Resize'}
      </div>
    </div>
  )
}

// ── Sortable block ─────────────────────────────────────────────────────────────

interface SortableBlockProps {
  block: BlockData
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isTranslationMode?: boolean
}

function SortableBlock({ block, isSelected, onSelect, onDelete, isTranslationMode }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const blockDefs = useEditorStore((s) => s.blockDefs)

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const codeDef = getCodeBlock(block.type)
  const dbDef = blockDefs.find((d) => d.type === block.type)
  const label = codeDef?.label ?? dbDef?.label ?? block.type

  if (!codeDef && !dbDef) return null

  return (
    <div ref={setNodeRef} style={style} className="relative group cursor-pointer" onClick={onSelect}>
      {/* selection outline */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all"
        style={{
          outline: isSelected ? '2px solid oklch(var(--p))' : '2px solid transparent',
          outlineOffset: '-2px',
        }}
      />

      {/* label + drag + delete controls */}
      <div className={`absolute top-2 right-2 z-20 flex items-center gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
        <span className="px-2 py-1 rounded text-xs font-medium bg-black/75 text-white/70">{label}</span>

        {!isTranslationMode && (
          <div
            {...attributes}
            {...listeners}
            className="px-2 py-1 rounded text-xs font-medium cursor-grab active:cursor-grabbing bg-black/75 text-white/70"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            ⠿
          </div>
        )}

        {!isTranslationMode && (
          <button
            className="px-2 py-1 rounded text-xs font-medium bg-error/85 text-error-content"
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            title="Delete block"
          >
            ✕
          </button>
        )}
      </div>

      {/* block content */}
      {codeDef ? (
        <codeDef.Component {...block.props} />
      ) : (
        <TemplateBlockRenderer template={dbDef!.template} props={block.props} />
      )}

      {/* resize handle */}
      {!isTranslationMode && <ResizeHandle blockId={block.id} />}
    </div>
  )
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export default function Canvas() {
  const sections = useEditorStore((s) => s.sections)
  const selectedId = useEditorStore((s) => s.selectedId)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const deleteBlock = useEditorStore((s) => s.deleteBlock)
  const isTranslationMode = useEditorStore((s) => s.activeLang !== 'en')

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="text-4xl opacity-20">+</div>
        <p className="text-sm text-base-content/30">Add blocks from the left panel to build your page.</p>
      </div>
    )
  }

  return (
    <div>
      {[...sections].sort((a, b) => a.order - b.order).map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          isSelected={selectedId === block.id}
          onSelect={() => setSelectedId(block.id)}
          onDelete={() => deleteBlock(block.id)}
          isTranslationMode={isTranslationMode}
        />
      ))}
    </div>
  )
}
