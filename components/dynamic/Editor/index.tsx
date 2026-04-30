'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
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
import { getAllBlockDefinitions } from '../BlockRegistry'
import Canvas from './Canvas'
import Sidebar from './Sidebar'
import PropsPanel from './PropsPanel'
import BlockBuilderPanel from './BlockBuilderPanel'
import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import type { PageSection } from '@/types/content/PageTypes'
import type { DynamicPageStatus } from '@/types/content/PageTypes'

export default function DynamicPageEditor() {
  const params = useParams<{ pageId: string }>()
  const router = useRouter()
  const pageId = params?.pageId

  const mode: 'create' | 'edit' = useMemo(
    () => (pageId === 'create' ? 'create' : 'edit'),
    [pageId]
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [sections, setSections] = useState<PageSection[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<DynamicPageStatus>('DRAFT')

  // Load page (edit mode)
  useEffect(() => {
    if (mode === 'create') {
      setLoading(false)
      return
    }

    let cancelled = false
    axiosInstance
      .get(`/api/dynamic-pages/${pageId}`)
      .then((res) => {
        if (cancelled) return
        const raw = res.data.page
        setTitle(raw.title ?? '')
        setSlug(raw.slug ?? '')
        setStatus(raw.status ?? 'DRAFT')
        setSections(
          Array.isArray(raw.sections)
            ? (raw.sections as PageSection[]).sort((a, b) => a.order - b.order)
            : []
        )
      })
      .catch(() => toast.error('Failed to load page'))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [pageId, mode])

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
    const newSection: PageSection = {
      id: uuidv4(),
      type,
      order: sections.length,
      props: { ...def.defaultProps },
    }
    setSections((prev) => [...prev, newSection])
    setSelectedId(newSection.id)
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
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!slug.trim()) { toast.error('Slug is required'); return }

    const body = {
      title,
      slug,
      status,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await axiosInstance.post('/api/dynamic-pages', body)
        toast.success('Page created')
        router.replace(`/admin/pages/${res.data.page.dynamicPageId}`)
      } else {
        await axiosInstance.patch(`/api/dynamic-pages/${pageId}`, body)
        toast.success('Page saved')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const selectedBlock = sections.find((b) => b.id === selectedId) ?? null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-base-200">
        <span className="loading loading-spinner loading-md text-base-content/40" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-base-300" style={{ top: '64px' }}>
      {/* Top bar */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-base-content/10 flex-shrink-0 bg-base-200">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Page title"
          className="flex-1 px-3 py-1.5 rounded-md text-sm text-base-content outline-none min-w-0 bg-base-300 border border-base-content/10"
        />

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="text-xs text-base-content/40">/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
            className="w-40 px-3 py-1.5 rounded-md text-sm text-base-content outline-none bg-base-300 border border-base-content/10"
          />
        </div>

        <DynamicSelect
          options={[
            { label: 'Draft', value: 'DRAFT' },
            { label: 'Published', value: 'PUBLISHED' },
            { label: 'Archived', value: 'ARCHIVED' },
          ]}
          selectedValue={status}
          onValueChange={(v) => setStatus(v as DynamicPageStatus)}
        />

        <button
          onClick={() => router.push('/admin/pages')}
          className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70"
        >
          Cancel
        </button>

        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0 bg-primary text-primary-content"
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
                onSelect={(id) => setSelectedId(id)}
                onDelete={deleteBlock}
              />
            </SortableContext>
          </DndContext>
        </div>

        {selectedBlock?.type === 'custom' ? (
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
