import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
import { getAllBlockDefinitions } from '../../BlockRegistry'
import type { BlockData, DynamicPageStatus, PageMetadata } from '@/types/content/PageTypes'
import { DefaultPageMetadata } from '@/types/content/PageTypes'

type Router = { push: (href: string) => void; replace: (href: string) => void }

interface EditorStore {
  loading: boolean
  saving: boolean
  sections: BlockData[]
  selectedId: string | null
  title: string
  slug: string
  status: DynamicPageStatus
  description: string
  keywords: string[]
  metadata: PageMetadata

  setSelectedId: (id: string | null) => void
  setTitle: (v: string) => void
  setSlug: (v: string) => void
  setStatus: (v: DynamicPageStatus) => void
  setDescription: (v: string) => void
  setKeywords: (v: string[]) => void
  setMetadata: (v: PageMetadata) => void
  handleDragEnd: (event: DragEndEvent) => void
  addBlock: (type: string) => void
  deleteBlock: (id: string) => void
  updateBlockProps: (id: string, props: Record<string, unknown>) => void
  loadPage: (pageId: string) => Promise<void>
  handleSave: (mode: 'create' | 'edit', pageId: string, router: Router) => Promise<void>
  reset: () => void
}

const initialState = {
  loading: true,
  saving: false,
  sections: [] as BlockData[],
  selectedId: null as string | null,
  title: '',
  slug: '',
  status: 'DRAFT' as DynamicPageStatus,
  description: '',
  keywords: [] as string[],
  metadata: DefaultPageMetadata as PageMetadata,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setSelectedId: (id) => set({ selectedId: id }),
  setTitle: (v) => set({ title: v }),
  setSlug: (v) => set({ slug: v }),
  setStatus: (v) => set({ status: v }),
  setDescription: (v) => set({ description: v }),
  setKeywords: (v) => set({ keywords: v }),
  setMetadata: (v) => set({ metadata: v }),

  handleDragEnd: (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    set((state) => {
      const oldIndex = state.sections.findIndex((b) => b.id === active.id)
      const newIndex = state.sections.findIndex((b) => b.id === over.id)
      return {
        sections: arrayMove(state.sections, oldIndex, newIndex).map((b, i) => ({
          ...b,
          order: i,
        })),
      }
    })
  },

  addBlock: (type) => {
    const def = getAllBlockDefinitions().find((d) => d.type === type)
    if (!def) return
    const newSection: BlockData = {
      id: uuidv4(),
      type,
      order: get().sections.length,
      props: { ...def.defaultProps },
    }
    set((state) => ({
      sections: [...state.sections, newSection],
      selectedId: newSection.id,
    }))
  },

  deleteBlock: (id) => {
    set((state) => ({
      sections: state.sections
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i })),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
  },

  updateBlockProps: (id, props) => {
    set((state) => ({
      sections: state.sections.map((b) => (b.id === id ? { ...b, props } : b)),
    }))
  },

  loadPage: async (pageId) => {
    if (pageId === 'create') {
      set({ loading: false })
      return
    }
    set({ loading: true })
    try {
      const res = await axiosInstance.get(`/api/dynamic-pages/${pageId}`)
      const raw = res.data.page
      set({
        title: raw.title ?? '',
        slug: raw.slug ?? '',
        status: raw.status ?? 'DRAFT',
        description: raw.description ?? '',
        keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
        metadata: raw.metadata ?? DefaultPageMetadata,
        sections: Array.isArray(raw.sections)
          ? (raw.sections as BlockData[]).sort((a, b) => a.order - b.order)
          : [],
      })
    } catch {
      toast.error('Failed to load page')
    } finally {
      set({ loading: false })
    }
  },

  handleSave: async (mode, pageId, router) => {
    const { title, slug, status, description, keywords, metadata, sections } = get()
    if (!title.trim()) { toast.error('Title is required'); return }
    if (!slug.trim()) { toast.error('Slug is required'); return }

    const body = {
      title,
      slug,
      status,
      description,
      keywords,
      metadata,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    }

    set({ saving: true })
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
      set({ saving: false })
    }
  },

  reset: () => set(initialState),
}))

export const selectSelectedBlock = (state: EditorStore) =>
  state.sections.find((b) => b.id === state.selectedId) ?? null
