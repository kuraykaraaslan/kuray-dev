'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import type { BlockData } from '../types'
import { getAllBlockDefinitions } from '../BlockRegistry'
import Canvas from './Canvas'
import Sidebar from './Sidebar'
import PropsPanel from './PropsPanel'
import SEOPanel from './SEOPanel'
import BlockBuilderPanel from './BlockBuilderPanel'

interface MetadataFields {
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterCard?: string
}

interface Props {
  pageId: string
  title: string
  slug: string
  isPublished: boolean
  description?: string
  keywords?: string[]
  metadata?: MetadataFields
  initialSections: BlockData[]
  topBarExtra?: React.ReactNode
  onSave: (data: {
    title: string
    slug: string
    isPublished: boolean
    description: string
    keywords: string[]
    metadata: MetadataFields
    sections: BlockData[]
  }) => Promise<void>
}

export default function DynamicPageEditor({
  title: initialTitle,
  slug: initialSlug,
  isPublished: initialPublished,
  description: initialDescription = '',
  keywords: initialKeywords = [],
  metadata: initialMetadata = {},
  initialSections,
  topBarExtra,
  onSave,
}: Props) {
  const [sections, setSections] = useState<BlockData[]>(
    [...initialSections].sort((a, b) => a.order - b.order)
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState(initialTitle)
  const [slug, setSlug] = useState(initialSlug)
  const [isPublished, setIsPublished] = useState(initialPublished)
  const [description, setDescription] = useState(initialDescription)
  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [metadata, setMetadata] = useState<MetadataFields>(initialMetadata)
  const [showSEO, setShowSEO] = useState(false)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setSections((prev) => {
      const oldIndex = prev.findIndex((b) => b.id === active.id)
      const newIndex = prev.findIndex((b) => b.id === over.id)
      return arrayMove(prev, oldIndex, newIndex).map((b, i) => ({ ...b, order: i }))
    })
  }

  const addBlock = (type: string) => {
    const def = getAllBlockDefinitions().find((d) => d.type === type)
    if (!def) return

    const newBlock: BlockData = {
      id: uuidv4(),
      type,
      order: sections.length,
      props: { ...def.defaultProps },
    }
    setSections((prev) => [...prev, newBlock])
    setSelectedId(newBlock.id)
  }

  const deleteBlock = (id: string) => {
    setSections((prev) =>
      prev.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i }))
    )
    if (selectedId === id) setSelectedId(null)
  }

  const updateBlockProps = (id: string, props: Record<string, unknown>) => {
    setSections((prev) => prev.map((b) => (b.id === id ? { ...b, props } : b)))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ title, slug, isPublished, description, keywords, metadata, sections })
    } finally {
      setSaving(false)
    }
  }

  const selectedBlock = sections.find((b) => b.id === selectedId) ?? null

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ top: '64px', backgroundColor: '#282626' }}
    >
      {/* Top bar */}
      <div
        className="flex items-center gap-4 px-4 py-3 border-b flex-shrink-0"
        style={{ backgroundColor: '#1f1d1d', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          className="flex-1 px-3 py-1.5 rounded-md text-sm text-white outline-none min-w-0"
          style={{ backgroundColor: '#282626', border: '1px solid rgba(255,255,255,0.1)' }}
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            /products/
          </span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
            className="w-32 px-3 py-1.5 rounded-md text-sm text-white outline-none"
            style={{ backgroundColor: '#282626', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded"
            style={{ accentColor: '#ffc418' }}
          />
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Published
          </span>
        </label>

        <button
          onClick={() => { setShowSEO((v) => !v); setSelectedId(null) }}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0"
          style={{
            backgroundColor: showSEO ? '#ffc418' : 'rgba(255,255,255,0.08)',
            color: showSEO ? '#282626' : 'rgba(255,255,255,0.7)',
          }}
        >
          SEO
        </button>

        {topBarExtra}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0"
          style={{ backgroundColor: '#ffc418', color: '#282626' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <Sidebar onAdd={addBlock} />

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
                onSelect={(id) => { setSelectedId(id); setShowSEO(false) }}
                onDelete={deleteBlock}
              />
            </SortableContext>
          </DndContext>
        </div>

        {showSEO ? (
          <SEOPanel
            description={description}
            keywords={keywords}
            metadata={metadata}
            onChangeDescription={setDescription}
            onChangeKeywords={setKeywords}
            onChangeMetadata={setMetadata}
          />
        ) : selectedBlock?.type === 'custom' ? (
          <BlockBuilderPanel
            block={selectedBlock}
            onChange={(props) => updateBlockProps(selectedBlock.id, props)}
          />
        ) : (
          <PropsPanel
            block={selectedBlock}
            onChange={(props) => selectedBlock && updateBlockProps(selectedBlock.id, props)}
          />
        )}
      </div>
    </div>
  )
}
