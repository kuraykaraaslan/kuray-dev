'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import { v4 as uuidv4 } from 'uuid'
import { getAllBlockDefinitions } from '../../BlockRegistry'
import type { PageSection, DynamicPageStatus } from '@/types/content/PageTypes'

export function useEditorState() {
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
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to save page')
    } finally {
      setSaving(false)
    }
  }

  const selectedBlock = sections.find((b) => b.id === selectedId) ?? null

  return {
    loading,
    saving,
    sections,
    selectedId,
    setSelectedId,
    selectedBlock,
    title,
    setTitle,
    slug,
    setSlug,
    status,
    setStatus,
    sensors,
    handleDragEnd,
    addBlock,
    deleteBlock,
    updateBlockProps,
    handleSave,
    router,
  }
}
