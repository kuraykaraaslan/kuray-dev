import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
import { getCodeBlock } from '../../BlockRegistry'
import type { BlockData, DynamicPageStatus, PageMetadata } from '@/types/content/PageTypes'
import type { DynamicPageBlockRecord } from '../../types'

export type { DynamicPageBlockRecord }
import { DefaultPageMetadata } from '@/types/content/PageTypes'

type Router = { push: (href: string) => void; replace: (href: string) => void }

type TranslationEntry = {
  title: string
  description: string
  sections: BlockData[]
}

export type PreviewMode = 'mobile' | 'tablet' | 'desktop'

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
  backupOpen: boolean
  seoOpen: boolean
  translationOpen: boolean
  isDirty: boolean
  previewMode: PreviewMode
  undoStack: { sections: BlockData[]; selectedId: string | null }[]
  redoStack: { sections: BlockData[]; selectedId: string | null }[]

  // Block definitions (loaded from DB)
  blockDefs: DynamicPageBlockRecord[]
  loadBlockDefs: () => Promise<void>

  // Translation state
  pageId: string
  activeLang: string
  enSections: BlockData[]
  translationCache: Record<string, TranslationEntry>
  savedLangs: string[]

  setSelectedId: (id: string | null) => void
  setTitle: (v: string) => void
  setSlug: (v: string) => void
  setStatus: (v: DynamicPageStatus) => void
  setDescription: (v: string) => void
  setKeywords: (v: string[]) => void
  setMetadata: (v: PageMetadata) => void
  setBackupOpen: (v: boolean) => void
  setSeoOpen: (v: boolean) => void
  setTranslationOpen: (v: boolean) => void
  setPreviewMode: (v: PreviewMode) => void
  showShortcuts: boolean
  setShowShortcuts: (v: boolean) => void
  handleDragEnd: (event: DragEndEvent) => void
  addBlock: (type: string, atIndex?: number) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (id: string) => void
  toggleBlockHidden: (id: string) => void
  updateBlockProps: (id: string, props: Record<string, unknown>) => void
  updateBlockLabel: (id: string, label: string) => void
  moveBlock: (id: string, dir: -1 | 1) => void
  reorderBlocks: (fromId: string, toId: string) => void
  copyBlock: (id: string) => void
  pasteBlock: (atIndex?: number) => void
  clipboard: BlockData | null
  snapshotForUndo: () => void
  undo: () => void
  redo: () => void
  loadPage: (pageId: string) => Promise<void>
  handleSave: (mode: 'create' | 'edit', pageId: string, router: Router) => Promise<void>
  reset: () => void

  // Translation actions
  setActiveLang: (lang: string) => void
  setTranslationTitle: (lang: string, v: string) => void
  setTranslationDescription: (lang: string, v: string) => void
  addTranslation: (lang: string, data: TranslationEntry) => void
  saveTranslation: () => Promise<void>
  deleteTranslation: (lang: string) => Promise<void>
}

const initialState = {
  loading: false,
  saving: false,
  sections: [] as BlockData[],
  selectedId: null as string | null,
  clipboard: null as BlockData | null,
  title: '',
  slug: '',
  status: 'DRAFT' as DynamicPageStatus,
  description: '',
  keywords: [] as string[],
  metadata: DefaultPageMetadata as PageMetadata,
  backupOpen: false,
  seoOpen: false,
  translationOpen: false,
  isDirty: false,
  previewMode: 'desktop' as PreviewMode,
  undoStack: [] as { sections: BlockData[]; selectedId: string | null }[],
  redoStack: [] as { sections: BlockData[]; selectedId: string | null }[],
  pageId: '',
  activeLang: 'en',
  enSections: [] as BlockData[],
  translationCache: {} as Record<string, TranslationEntry>,
  savedLangs: [] as string[],
  blockDefs: [] as DynamicPageBlockRecord[],
  showShortcuts: false,
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  ...initialState,

  setSelectedId: (id) => set({ selectedId: id }),
  setTitle: (v) => set({ title: v, isDirty: true }),
  setSlug: (v) => set({ slug: v, isDirty: true }),
  setStatus: (v) => set({ status: v, isDirty: true }),
  setDescription: (v) => set({ description: v, isDirty: true }),
  setKeywords: (v) => set({ keywords: v, isDirty: true }),
  setMetadata: (v) => set({ metadata: v, isDirty: true }),
  setBackupOpen: (v) => set({ backupOpen: v }),
  setSeoOpen: (v) => set({ seoOpen: v }),
  setTranslationOpen: (v) => set({ translationOpen: v }),
  setPreviewMode: (v) => set({ previewMode: v }),
  setShowShortcuts: (v) => set({ showShortcuts: v }),

  loadBlockDefs: async () => {
    try {
      const res = await axiosInstance.get('/api/dynamic-pages/block-definitions')
      const dbOnly = (res.data.blocks ?? []).filter((b: { source?: string }) => b.source !== 'code')
      set({ blockDefs: dbOnly })
    } catch {
      // silently fail — editor still works with code blocks
    }
  },

  handleDragEnd: (event) => {
    if (get().activeLang !== 'en') return
    const { active, over } = event
    if (!over || active.id === over.id) return
    set((state) => {
      const oldIndex = state.sections.findIndex((b) => b.id === active.id)
      const newIndex = state.sections.findIndex((b) => b.id === over.id)
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: arrayMove(state.sections, oldIndex, newIndex).map((b, i) => ({
          ...b,
          order: i,
        })),
      }
    })
  },

  addBlock: (type, atIndex) => {
    if (get().activeLang !== 'en') return
    const codeBlock = getCodeBlock(type)
    const dbBlock = get().blockDefs.find((d) => d.type === type)
    const defaultProps = codeBlock?.defaultProps ?? dbBlock?.defaultProps ?? {}
    const newSection: BlockData = {
      id: uuidv4(),
      type,
      order: 0,
      props: { ...defaultProps },
    }
    set((state) => {
      let newSections: BlockData[]
      if (atIndex !== undefined) {
        newSections = [
          ...state.sections.slice(0, atIndex),
          newSection,
          ...state.sections.slice(atIndex),
        ].map((b, i) => ({ ...b, order: i }))
      } else {
        newSections = [...state.sections, { ...newSection, order: state.sections.length }]
      }
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: newSections,
        selectedId: newSection.id,
      }
    })
  },

  deleteBlock: (id) => {
    if (get().activeLang !== 'en') return
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
      redoStack: [],
      isDirty: true,
      sections: state.sections
        .filter((b) => b.id !== id)
        .map((b, i) => ({ ...b, order: i })),
      selectedId: state.selectedId === id ? null : state.selectedId,
    }))
  },

  duplicateBlock: (id) => {
    if (get().activeLang !== 'en') return
    set((state) => {
      const original = state.sections.find((b) => b.id === id)
      if (!original) return {}
      const copy: BlockData = { ...original, id: uuidv4(), props: structuredClone(original.props) }
      const insertIdx = state.sections.findIndex((b) => b.id === id) + 1
      const newSections = [
        ...state.sections.slice(0, insertIdx),
        copy,
        ...state.sections.slice(insertIdx),
      ].map((b, i) => ({ ...b, order: i }))
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: newSections,
        selectedId: copy.id,
      }
    })
  },

  toggleBlockHidden: (id) => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
      redoStack: [],
      isDirty: true,
      sections: state.sections.map((b) =>
        b.id === id ? { ...b, hidden: !b.hidden } : b
      ),
    }))
  },

  moveBlock: (id, dir) => {
    if (get().activeLang !== 'en') return
    set((state) => {
      const idx = state.sections.findIndex((b) => b.id === id)
      if (idx < 0) return {}
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= state.sections.length) return {}
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: arrayMove(state.sections, idx, newIdx).map((b, i) => ({ ...b, order: i })),
      }
    })
  },

  reorderBlocks: (fromId, toId) => {
    if (get().activeLang !== 'en') return
    set((state) => {
      const oldIndex = state.sections.findIndex((b) => b.id === fromId)
      const newIndex = state.sections.findIndex((b) => b.id === toId)
      if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return {}
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: arrayMove(state.sections, oldIndex, newIndex).map((b, i) => ({ ...b, order: i })),
      }
    })
  },

  copyBlock: (id) => {
    const block = get().sections.find((b) => b.id === id)
    if (!block) return
    set({ clipboard: { ...block } })
    toast.success('Block copied')
  },

  pasteBlock: (atIndex) => {
    if (get().activeLang !== 'en') return
    const { clipboard } = get()
    if (!clipboard) return
    const newBlock: BlockData = { ...clipboard, id: uuidv4() }
    set((state) => {
      const insertAt = atIndex ?? (
        state.selectedId
          ? (state.sections.findIndex((b) => b.id === state.selectedId) + 1)
          : state.sections.length
      )
      const newSections = [
        ...state.sections.slice(0, insertAt),
        { ...newBlock, order: insertAt },
        ...state.sections.slice(insertAt),
      ].map((b, i) => ({ ...b, order: i }))
      return {
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
        redoStack: [],
        isDirty: true,
        sections: newSections,
        selectedId: newBlock.id,
      }
    })
  },

  snapshotForUndo: () => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
      redoStack: [],
    }))
  },

  updateBlockProps: (id, props) => {
    set((state) => ({
      isDirty: true,
      sections: state.sections.map((b) => (b.id === id ? { ...b, props } : b)),
    }))
  },

  updateBlockLabel: (id, label) => {
    set((state) => ({
      isDirty: true,
      sections: state.sections.map((b) => b.id === id ? { ...b, label: label || undefined } : b),
    }))
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return {}
      const prev = state.undoStack[state.undoStack.length - 1]
      return {
        sections: prev.sections,
        selectedId: prev.selectedId,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
      }
    })
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return {}
      const next = state.redoStack[state.redoStack.length - 1]
      return {
        sections: next.sections,
        selectedId: next.selectedId,
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack.slice(-49), { sections: state.sections, selectedId: state.selectedId }],
      }
    })
  },

  loadPage: async (pageId) => {
    if (pageId === 'create') {
      set({ loading: false, pageId: '', isDirty: false })
      return
    }
    set({ loading: true, pageId })
    try {
      const [pageRes, translationsRes] = await Promise.all([
        axiosInstance.get(`/api/dynamic-pages/${pageId}`),
        axiosInstance.get(`/api/dynamic-pages/${pageId}/translations`),
      ])

      const raw = pageRes.data.page
      const enSections: BlockData[] = Array.isArray(raw.sections)
        ? (raw.sections as BlockData[]).sort((a, b) => a.order - b.order)
        : []

      const translationList: Array<{
        lang: string
        title: string
        description: string | null
        sections: unknown
      }> = translationsRes.data.translations ?? []

      const cache: Record<string, TranslationEntry> = {}
      const savedLangs: string[] = []

      for (const t of translationList) {
        const tSections = Array.isArray(t.sections)
          ? (t.sections as BlockData[]).sort((a, b) => a.order - b.order)
          : []
        cache[t.lang] = {
          title: t.title,
          description: t.description ?? '',
          sections: tSections,
        }
        savedLangs.push(t.lang)
      }

      set({
        title: raw.title ?? '',
        slug: raw.slug ?? '',
        status: raw.status ?? 'DRAFT',
        description: raw.description ?? '',
        keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
        metadata: raw.metadata ?? DefaultPageMetadata,
        sections: enSections,
        enSections,
        translationCache: cache,
        savedLangs,
        activeLang: 'en',
        isDirty: false,
        undoStack: [],
        redoStack: [],
      })
    } catch {
      toast.error('Failed to load page')
    } finally {
      set({ loading: false })
    }
  },

  handleSave: async (mode, pageId, router) => {
    const { title, slug, status, description, keywords, metadata, sections, enSections, activeLang, translationCache } = get()
    if (!title.trim()) { toast.error('Title is required'); return }

    const enSectionsToSave = activeLang === 'en' ? sections : enSections

    const body = {
      title,
      slug,
      status,
      description,
      keywords,
      metadata,
      sections: enSectionsToSave.map((s, i) => ({ ...s, order: i })),
    }

    set({ saving: true })
    try {
      if (mode === 'create') {
        const res = await axiosInstance.post('/api/dynamic-pages', body)
        toast.success('Page created')
        set({ isDirty: false })
        router.replace(`/admin/pages/${res.data.page.dynamicPageId}`)
        return
      }

      const latestCache = { ...translationCache }
      if (activeLang !== 'en' && latestCache[activeLang]) {
        latestCache[activeLang] = { ...latestCache[activeLang], sections: sections.map((s, i) => ({ ...s, order: i })) }
      }

      const translationEntries = Object.entries(latestCache).filter(([lang]) => lang !== 'en')

      await Promise.all([
        axiosInstance.patch(`/api/dynamic-pages/${pageId}`, body),
        ...translationEntries
          .filter(([, entry]) => entry.title.trim())
          .map(([lang, entry]) =>
            axiosInstance.post(`/api/dynamic-pages/${pageId}/translations`, {
              lang,
              title: entry.title,
              description: entry.description || null,
              sections: entry.sections.map((s, i) => ({ ...s, order: i })),
            })
          ),
      ])

      const savedTranslationLangs = translationEntries.map(([lang]) => lang)
      set({
        savedLangs: [...new Set([...get().savedLangs, ...savedTranslationLangs])],
        isDirty: false,
      })
      toast.success('Page and translations saved')
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to save page')
    } finally {
      set({ saving: false })
    }
  },

  reset: () => set(initialState),

  setActiveLang: (lang) => {
    const { activeLang, sections, translationCache, enSections } = get()

    const currentEnSections = activeLang === 'en' ? sections : enSections

    if (activeLang !== 'en') {
      const entry = translationCache[activeLang]
      if (entry) {
        set({
          translationCache: {
            ...translationCache,
            [activeLang]: { ...entry, sections },
          },
        })
      }
    }

    if (lang === 'en') {
      set({ activeLang: 'en', sections: currentEnSections, enSections: currentEnSections, selectedId: null })
      return
    }

    const updated = get().translationCache
    const existing = updated[lang]
    const newSections = existing?.sections ?? [...currentEnSections]

    if (!existing) {
      set({
        translationCache: {
          ...updated,
          [lang]: { title: get().title, description: get().description, sections: newSections },
        },
      })
    }

    set({
      activeLang: lang,
      sections: newSections,
      enSections: currentEnSections,
      selectedId: null,
    })
  },

  setTranslationTitle: (lang, v) => {
    const { translationCache } = get()
    const entry = translationCache[lang]
    if (!entry) return
    set({ translationCache: { ...translationCache, [lang]: { ...entry, title: v } }, isDirty: true })
  },

  setTranslationDescription: (lang, v) => {
    const { translationCache } = get()
    const entry = translationCache[lang]
    if (!entry) return
    set({ translationCache: { ...translationCache, [lang]: { ...entry, description: v } }, isDirty: true })
  },

  addTranslation: (lang, data) => {
    const { translationCache, savedLangs } = get()
    set({
      translationCache: { ...translationCache, [lang]: data },
      savedLangs: [...new Set([...savedLangs, lang])],
    })
  },

  saveTranslation: async () => {
    const { activeLang, pageId, sections, translationCache } = get()
    if (activeLang === 'en' || !pageId) return

    const entry = translationCache[activeLang]
    if (!entry) return
    if (!entry.title.trim()) { toast.error('Translation title is required'); return }

    set({ saving: true })
    try {
      await axiosInstance.post(`/api/dynamic-pages/${pageId}/translations`, {
        lang: activeLang,
        title: entry.title,
        description: entry.description || null,
        sections: sections.map((s, i) => ({ ...s, order: i })),
      })
      set((state) => ({
        savedLangs: [...new Set([...state.savedLangs, activeLang])],
        isDirty: false,
        translationCache: {
          ...state.translationCache,
          [activeLang]: { ...entry, sections: sections.map((s, i) => ({ ...s, order: i })) },
        },
      }))
      toast.success(`${activeLang.toUpperCase()} translation saved`)
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to save translation')
    } finally {
      set({ saving: false })
    }
  },

  deleteTranslation: async (lang) => {
    const { pageId, activeLang, translationCache, savedLangs, enSections } = get()
    if (!pageId) return
    try {
      await axiosInstance.delete(`/api/dynamic-pages/${pageId}/translations/${lang}`)
      const newCache = { ...translationCache }
      delete newCache[lang]
      set({ translationCache: newCache, savedLangs: savedLangs.filter((l) => l !== lang) })
      if (activeLang === lang) {
        set({ activeLang: 'en', sections: enSections, selectedId: null })
      }
      toast.success(`${lang.toUpperCase()} translation deleted`)
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Failed to delete translation')
    }
  },
}))

export const selectSelectedBlock = (state: EditorStore) =>
  state.sections.find((b) => b.id === state.selectedId) ?? null
