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
  handleDragEnd: (event: DragEndEvent) => void
  addBlock: (type: string) => void
  deleteBlock: (id: string) => void
  updateBlockProps: (id: string, props: Record<string, unknown>) => void
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
  backupOpen: false,
  seoOpen: false,
  translationOpen: false,
  pageId: '',
  activeLang: 'en',
  enSections: [] as BlockData[],
  translationCache: {} as Record<string, TranslationEntry>,
  savedLangs: [] as string[],
  blockDefs: [] as DynamicPageBlockRecord[],
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
  setBackupOpen: (v) => set({ backupOpen: v }),
  setSeoOpen: (v) => set({ seoOpen: v }),
  setTranslationOpen: (v) => set({ translationOpen: v }),

  loadBlockDefs: async () => {
    try {
      const res = await axiosInstance.get('/api/dynamic-pages/block-definitions')
      set({ blockDefs: res.data.blocks ?? [] })
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
        sections: arrayMove(state.sections, oldIndex, newIndex).map((b, i) => ({
          ...b,
          order: i,
        })),
      }
    })
  },

  addBlock: (type) => {
    if (get().activeLang !== 'en') return
    const codeBlock = getCodeBlock(type)
    const dbBlock = get().blockDefs.find((d) => d.type === type)
    const defaultProps = codeBlock?.defaultProps ?? dbBlock?.defaultProps ?? {}
    const newSection: BlockData = {
      id: uuidv4(),
      type,
      order: get().sections.length,
      props: { ...defaultProps },
    }
    set((state) => ({
      sections: [...state.sections, newSection],
      selectedId: newSection.id,
    }))
  },

  deleteBlock: (id) => {
    if (get().activeLang !== 'en') return
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
      set({ loading: false, pageId: '' })
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

    // EN modundayken sections, çeviri modundayken enSections kullan
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
        router.replace(`/admin/pages/${res.data.page.dynamicPageId}`)
        return
      }

      // Aktif translation sections'ı da cache'e yaz (henüz yazılmadıysa)
      const latestCache = { ...translationCache }
      if (activeLang !== 'en' && latestCache[activeLang]) {
        latestCache[activeLang] = { ...latestCache[activeLang], sections: sections.map((s, i) => ({ ...s, order: i })) }
      }

      // EN sayfası + tüm çevirileri paralel kaydet
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
      set({ savedLangs: [...new Set([...get().savedLangs, ...savedTranslationLangs])] })
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

    // Dil değişmeden önce mevcut sections'ı cache'e kaydet
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
    set({ translationCache: { ...translationCache, [lang]: { ...entry, title: v } } })
  },

  setTranslationDescription: (lang, v) => {
    const { translationCache } = get()
    const entry = translationCache[lang]
    if (!entry) return
    set({ translationCache: { ...translationCache, [lang]: { ...entry, description: v } } })
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
