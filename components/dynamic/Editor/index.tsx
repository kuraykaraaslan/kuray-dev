'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
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
import { toast } from 'react-toastify'
import Canvas from './Canvas'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import EditorTopBar from './EditorTopBar'
import { useEditorStore } from './stores/editorStore'

const DRAFT_KEY = (pageId: string) =>
  pageId === 'create' ? 'dynamic_editor_draft_new' : `dynamic_editor_draft_${pageId}`

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
  const setShowShortcuts = useEditorStore((s) => s.setShowShortcuts)

  const [sidebarDrag, setSidebarDrag] = useState<{ type: string; label: string } | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // Check for saved draft after loading completes
  useEffect(() => {
    if (loading) return
    try {
      const raw = localStorage.getItem(DRAFT_KEY(pageId))
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed._savedAt) setDraftSavedAt(parsed._savedAt)
    } catch { /* ignore */ }
  }, [loading, pageId])

  // Auto-save to localStorage 10s after last change while dirty
  useEffect(() => {
    if (!isDirty) {
      // Clear draft when saved successfully
      try { localStorage.removeItem(DRAFT_KEY(pageId)) } catch { /* ignore */ }
      setDraftSavedAt(null)
      return
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => {
      const s = useEditorStore.getState()
      try {
        localStorage.setItem(DRAFT_KEY(pageId), JSON.stringify({
          _savedAt: Date.now(),
          title: s.title,
          slug: s.slug,
          status: s.status,
          description: s.description,
          keywords: s.keywords,
          metadata: s.metadata,
          sections: s.sections,
          enSections: s.enSections,
          translationCache: s.translationCache,
          savedLangs: s.savedLangs,
        }))
      } catch { /* localStorage might be full */ }
    }, 10_000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [isDirty, sections, pageId])

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY(pageId))
      if (!raw) return
      const parsed = JSON.parse(raw)
      useEditorStore.setState({
        title: parsed.title ?? '',
        slug: parsed.slug ?? '',
        status: parsed.status ?? 'DRAFT',
        description: parsed.description ?? '',
        keywords: parsed.keywords ?? [],
        metadata: parsed.metadata,
        sections: (parsed.sections ?? []).map((s: { order: number }, i: number) => ({ ...s, order: i })),
        enSections: (parsed.enSections ?? []).map((s: { order: number }, i: number) => ({ ...s, order: i })),
        translationCache: parsed.translationCache ?? {},
        savedLangs: parsed.savedLangs ?? [],
        isDirty: true,
        selectedId: null,
      })
      setDraftSavedAt(null)
      toast.success('Draft restored')
    } catch {
      toast.error('Failed to restore draft')
    }
  }, [pageId])

  const discardDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY(pageId)) } catch { /* ignore */ }
    setDraftSavedAt(null)
  }, [pageId])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey
      const alt = e.altKey
      const tag = (e.target as HTMLElement).tagName
      const isEditing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag) || (e.target as HTMLElement).isContentEditable

      if (ctrl) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
        if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo(); return }
        if (e.key === '/') { e.preventDefault(); setShowShortcuts(true); return }
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
  }, [undo, redo, deleteBlock, duplicateBlock, copyBlock, pasteBlock, moveBlock, setSelectedId, handleSave, setShowShortcuts, mode, pageId, router])

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

      {/* Draft recovery banner */}
      {draftSavedAt && (
        <div className="flex-shrink-0 flex items-center justify-between gap-4 px-4 py-2 bg-warning/10 border-b border-warning/20">
          <span className="text-xs text-warning font-medium">
            Unsaved draft found — last auto-saved at {new Date(draftSavedAt).toLocaleTimeString()}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={restoreDraft}
              className="px-3 py-1 text-xs rounded-md bg-warning text-warning-content font-medium hover:opacity-90 transition-opacity"
            >
              Restore
            </button>
            <button
              onClick={discardDraft}
              className="px-3 py-1 text-xs rounded-md bg-base-300 text-base-content/60 hover:text-base-content transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

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
