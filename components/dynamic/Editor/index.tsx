'use client'

import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Canvas from './Canvas'
import LeftSidebar from './LeftSidebar'
import RightSidebar from './RightSidebar'
import EditorTopBar from './EditorTopBar'
import { useEditorState } from './hooks/useEditorState'

export default function DynamicPageEditor() {
  const {
    loading, saving,
    sections,
    selectedId, setSelectedId, selectedBlock,
    title, setTitle,
    slug, setSlug,
    status, setStatus,
    sensors,
    handleDragEnd,
    addBlock, deleteBlock, updateBlockProps,
    handleSave,
    router,
  } = useEditorState()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="loading loading-spinner loading-md text-base-content/40" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-base-300" style={{ top: '64px' }}>
      <EditorTopBar
        title={title}
        onTitleChange={setTitle}
        slug={slug}
        onSlugChange={setSlug}
        status={status}
        onStatusChange={setStatus}
        saving={saving}
        loading={loading}
        onSave={handleSave}
        onCancel={() => router.push('/admin/pages')}
      />

      <div className="flex flex-1 min-h-0">
        <LeftSidebar onAdd={addBlock} />

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
              <Canvas
                sections={sections}
                selectedId={selectedId}
                onSelect={(id) => setSelectedId(id)}
                onDelete={deleteBlock}
              />
            </SortableContext>
          </DndContext>
        </div>

        <RightSidebar
          block={selectedBlock}
          onChange={(props) => selectedBlock && updateBlockProps(selectedBlock.id, props)}
        />
      </div>
    </div>
  )
}
