'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
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
  const handleDragEnd = useEditorStore((s) => s.handleDragEnd)
  const loadPage = useEditorStore((s) => s.loadPage)
  const loadBlockDefs = useEditorStore((s) => s.loadBlockDefs)
  const handleSave = useEditorStore((s) => s.handleSave)
  const reset = useEditorStore((s) => s.reset)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    loadBlockDefs()
    loadPage(pageId)
    return () => reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

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

      <div className="flex flex-1 min-h-0">
        <LeftSidebar />

        <div className="flex-1 overflow-y-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((b) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <Canvas />
            </SortableContext>
          </DndContext>
        </div>

        <RightSidebar />
      </div>
    </div>
  )
}
