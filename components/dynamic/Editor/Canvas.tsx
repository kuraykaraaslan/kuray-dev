'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BlockData } from '../types'
import { getBlock } from '../BlockRegistry'

interface SortableBlockProps {
  block: BlockData
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
}

function SortableBlock({ block, isSelected, onSelect, onDelete }: SortableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const def = getBlock(block.type)
  if (!def) return null

  const { Component } = def

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group cursor-pointer"
      onClick={onSelect}
    >
      {/* Hover/selected outline */}
      <div
        className="absolute inset-0 z-10 pointer-events-none transition-all"
        style={{
          outline: isSelected
            ? '2px solid #ffc418'
            : '2px solid transparent',
          outlineOffset: '-2px',
        }}
      />

      {/* Controls bar — visible on hover or when selected */}
      <div
        className={`absolute top-2 right-2 z-20 flex items-center gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
      >
        {/* Type label */}
        <span
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'rgba(255,255,255,0.7)' }}
        >
          {def.label}
        </span>

        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="px-2 py-1 rounded text-xs font-medium cursor-grab active:cursor-grabbing"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'rgba(255,255,255,0.7)' }}
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          ⠿
        </div>

        {/* Delete */}
        <button
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ backgroundColor: 'rgba(220,38,38,0.85)', color: 'white' }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          title="Delete block"
        >
          ✕
        </button>
      </div>

      <Component {...block.props} />
    </div>
  )
}

interface CanvasProps {
  sections: BlockData[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

export default function Canvas({ sections, selectedId, onSelect, onDelete }: CanvasProps) {
  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-3">
        <div className="text-4xl opacity-20">+</div>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Add blocks from the left panel to build your page.
        </p>
      </div>
    )
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div>
      {sorted.map((block) => (
        <SortableBlock
          key={block.id}
          block={block}
          isSelected={selectedId === block.id}
          onSelect={() => onSelect(block.id)}
          onDelete={() => onDelete(block.id)}
        />
      ))}
    </div>
  )
}
