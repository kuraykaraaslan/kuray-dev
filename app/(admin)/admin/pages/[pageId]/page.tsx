'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import axiosInstance from '@/libs/axios'
import DynamicPageEditor from '@/components/dynamic/Editor'
import type { BlockData } from '@/components/dynamic/types'

interface MetadataFields {
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterCard?: string
}

interface PageData {
  dynamicPageId: string
  title: string
  slug: string
  isPublished: boolean
  description: string
  keywords: string[]
  metadata: MetadataFields
  sections: BlockData[]
}

const DEFAULT_PAGE: Omit<PageData, 'dynamicPageId'> = {
  title: '',
  slug: '',
  isPublished: false,
  description: '',
  keywords: [],
  metadata: {},
  sections: [],
}

export default function AdminPageEditor() {
  const params = useParams<{ pageId: string }>()
  const router = useRouter()
  const pageId = params?.pageId

  const mode: 'create' | 'edit' = useMemo(
    () => (pageId === 'create' ? 'create' : 'edit'),
    [pageId]
  )

  const [page, setPage] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (mode === 'create') {
      setPage({ dynamicPageId: 'create', ...DEFAULT_PAGE })
      setLoading(false)
      return
    }

    axiosInstance
      .get(`/api/dynamic-pages/${pageId}`)
      .then((res) => {
        const raw = res.data.page
        setPage({
          ...raw,
          description: raw.description ?? '',
          keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
          metadata: raw.metadata ?? {},
          sections: Array.isArray(raw.sections) ? (raw.sections as BlockData[]) : [],
        })
      })
      .catch(() => toast.error('Failed to load page'))
      .finally(() => setLoading(false))
  }, [pageId, mode])

  const handleSave = async (data: {
    title: string
    slug: string
    isPublished: boolean
    description: string
    keywords: string[]
    metadata: MetadataFields
    sections: BlockData[]
  }) => {
    try {
      if (mode === 'create') {
        const res = await axiosInstance.post('/api/dynamic-pages', data)
        toast.success('Page created')
        router.replace(`/admin/pages/${res.data.page.dynamicPageId}`)
      } else {
        await axiosInstance.patch(`/api/dynamic-pages/${pageId}`, data)
        toast.success('Page saved')
      }
    } catch {
      toast.error('Failed to save page')
    }
  }

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: '#282626' }}
      >
        <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</p>
      </div>
    )
  }

  if (!page) return null

  return (
    <DynamicPageEditor
      pageId={page.dynamicPageId}
      title={page.title}
      slug={page.slug}
      isPublished={page.isPublished}
      description={page.description}
      keywords={page.keywords}
      metadata={page.metadata}
      initialSections={page.sections}
      onSave={handleSave}
    />
  )
}
