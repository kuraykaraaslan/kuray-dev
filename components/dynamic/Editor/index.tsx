'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import Canvas from './Canvas'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import EditorTopBar from './EditorTopBar'
import { useEditorStore } from './stores/editorStore'

export default function DynamicPageEditor() {
  const params = useParams<{ pageId: string }>()
  const router = useRouter()
  const pageId = params?.pageId
  const mode = useMemo<'create' | 'edit'>(
    () => (pageId === 'create' ? 'create' : 'edit'),
    [pageId]
  )

  const loading = useEditorStore((s) => s.loading)
  const sections = useEditorStore((s) => s.sections)
  const selectedId = useEditorStore((s) => s.selectedId)
  const storeHandleDragEnd = useEditorStore((s) => s.handleDragEnd)
  const addBlock = useEditorStore((s) => s.addBlock)
  const deleteBlock = useEditorStore((s) => s.deleteBlock)
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock)
  const moveBlock = useEditorStore((s) => s.moveBlock)
  const copyBlock = useEditorStore((s) => s.copyBlock)
  const pasteBlock = useEditorStore((s) => s.pasteBlock)
  const setSelectedId = useEditorStore((s) => s.setSelectedId)
  const loadPage = useEditorStore((s) => s.loadPage)
  const loadBlockDefs = useEditorStore((s) => s.loadBlockDefs)
  const handleSave = useEditorStore((s) => s.handleSave)
  const reset = useEditorStore((s) => s.reset)
  const undo = useEditorStore((s) => s.undo)
  const redo = useEditorStore((s) => s.redo)
  const isDirty = useEditorStore((s) => s.isDirty)

  const [sidebarDrag, setSidebarDrag] = useState<{ type: string; label: string } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    loadBlockDefs()
    loadPage(pageId)
    return () => reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const alt = e.altKey
      const tag = (e.target as HTMLElement).tagName

      // Don't intercept shortcuts when typing inside an input/textarea
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target as HTMLElement).isContentEditable

      if (ctrl) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return }
        if (!isEditing) {
          if (e.key === 's') { e.preventDefault(); handleSave(mode, pageId, router); return }
          if (e.key === 'd') {
            const id = useEditorStore.getState().selectedId
            if (id) { e.preventDefault(); duplicateBlock(id) }
            return
          }
          if (e.key === 'c') {
            const id = useEditorStore.getState().selectedId
            if (id) { e.preventDefault(); copyBlock(id) }
            return
          }
          if (e.key === 'v') { e.preventDefault(); pasteBlock(); return }
        }
      }

      if (!isEditing) {
        if (e.key === 'Escape') { setSelectedId(null); return }
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const id = useEditorStore.getState().selectedId
          if (id) { e.preventDefault(); deleteBlock(id) }
          return
        }
        if (alt && e.key === 'ArrowUp') {
          const id = useEditorStore.getState().selectedId
          if (id) { e.preventDefault(); moveBlock(id, -1) }
          return
        }
        if (alt && e.key === 'ArrowDown') {
          const id = useEditorStore.getState().selectedId
          if (id) { e.preventDefault(); moveBlock(id, 1) }
          return
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, deleteBlock, duplicateBlock, copyBlock, pasteBlock, moveBlock, setSelectedId, handleSave, mode, pageId, router])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) e.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  const onDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.fromSidebar) {
      setSidebarDrag({ type: data.blockType, label: data.blockLabel ?? data.blockType })
    }
  }, [])

  const onDragEnd = useCallback((event: DragEndEvent) => {
    setSidebarDrag(null)
    const { active, over } = event

    if (active.data.current?.fromSidebar) {
      if (!over) return
      const overId = String(over.id)
      const blockType = active.data.current.blockType

      if (overId.startsWith('insert-gap-')) {
        const index = parseInt(overId.replace('insert-gap-', ''), 10)
        addBlock(blockType, index)
      } else {
        const blockIndex = sections.findIndex((b) => b.id === overId)
        addBlock(blockType, blockIndex >= 0 ? blockIndex + 1 : undefined)
      }
      return
    }

    storeHandleDragEnd(event)
  }, [sections, addBlock, storeHandleDragEnd])

  if (loading) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-base-200" style={{ top: '64px' }}>
        <span className="loading loading-spinner loading-md text-base-content/40" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-base-300" style={{ top: '64px' }}>
      <EditorTopBar
        onSave={() => handleSave(mode, pageId, router)}
        onCancel={() => router.push('/admin/pages')}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="flex flex-1 min-h-0">
          <LeftSidebar />

          <div className="flex-1 overflow-y-auto">
            <SortableContext
              items={sections.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <Canvas />
            </SortableContext>
          </div>

          <RightSidebar />
        </div>

        <DragOverlay dropAnimation={null}>
          {sidebarDrag ? (
            <div className="bg-base-100 rounded-lg shadow-2xl px-4 py-2.5 text-sm font-semibold border border-primary/50 text-primary opacity-90 pointer-events-none select-none">
              + {sidebarDrag.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
