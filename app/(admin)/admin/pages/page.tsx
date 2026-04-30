'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Table, {
  TableProvider,
  TableHeader,
  TableBody,
  TableFooter,
  type ColumnDef,
  type ActionButton,
} from '@/components/common/Forms/DynamicTable'
import axiosInstance from '@/libs/axios'

interface DynamicPageRow extends Record<string, unknown> {
  dynamicPageId: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  updatedAt: string
}

const PagesPage = () => {
  const router = useRouter()

  const [aiState, setAiState] = useState<
    | { status: 'idle' }
    | { status: 'open' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
  >({ status: 'idle' })

  const [prompt, setPrompt] = useState('')

  const openModal = () => {
    setPrompt('')
    setAiState({ status: 'open' })
  }

  const closeModal = () => setAiState({ status: 'idle' })

  const generate = async () => {
    if (!prompt.trim()) return
    setAiState({ status: 'loading' })
    try {
      const res = await axiosInstance.post('/api/dynamic-pages/generate', {
        prompt: prompt.trim(),
        save: true,
      })
      const pageId = res.data.page?.dynamicPageId
      closeModal()
      if (pageId) router.push(`/admin/pages/${pageId}`)
      else router.refresh()
    } catch (err: any) {
      setAiState({
        status: 'error',
        message: err.response?.data?.message ?? err.message,
      })
    }
  }

  const columns: ColumnDef<DynamicPageRow>[] = [
    { key: 'title', header: 'Title', accessor: (p) => p.title },
    { key: 'slug', header: 'Slug', accessor: (p) => p.slug },
    {
      key: 'status',
      header: 'Status',
      accessor: (p) => {
        const colors: Record<string, { bg: string; text: string; label: string }> = {
          PUBLISHED: { bg: 'rgba(34,197,94,0.15)', text: '#4ade80', label: 'Published' },
          DRAFT: { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.4)', label: 'Draft' },
          ARCHIVED: { bg: 'rgba(156,163,175,0.15)', text: 'rgba(156,163,175,0.6)', label: 'Archived' },
        }
        const c = colors[p.status] ?? colors.DRAFT
        return (
          <span
            className="px-2 py-0.5 rounded text-xs font-medium"
            style={{ backgroundColor: c.bg, color: c.text }}
          >
            {c.label}
          </span>
        )
      },
    },
    {
      key: 'updatedAt',
      header: 'Last Updated',
      accessor: (p) => new Date(p.updatedAt).toLocaleDateString(),
    },
  ]

  const actions: ActionButton<DynamicPageRow>[] = [
    {
      label: 'Edit',
      href: (p) => `/admin/pages/${p.dynamicPageId}`,
      className: 'btn-primary',
    },
    {
      label: 'View',
      href: (p) => `/projects/${p.slug}`,
      className: 'btn-secondary',
    },
    {
      label: 'Delete',
      onClick: async (p) => {
        if (!confirm(`Delete "${p.title}"?`)) return
        await axiosInstance.delete(`/api/dynamic-pages/${p.dynamicPageId}`)
      },
      className: 'text-danger',
      hideOnMobile: true,
    },
  ]

  return (
    <>
      <TableProvider<DynamicPageRow>
        apiEndpoint="/api/dynamic-pages"
        dataKey="pages"
        idKey="dynamicPageId"
        columns={columns}
        actions={actions}
      >
        <Table>
          <TableHeader
            title="Pages"
            searchPlaceholder="Search pages…"
            buttons={
              [
                { label: 'New Page', href: '/admin/pages/create' },
                {
                  label: '✦ Generate with AI',
                  onClick: openModal,
                  className: 'btn-ghost',
                },
              ]
            }
          />
          <TableBody />
          <TableFooter showingText="Showing" previousText="Previous" nextText="Next" />
        </Table>
      </TableProvider>

      {/* AI Generate Modal */}
      {(aiState.status === 'open' || aiState.status === 'loading' || aiState.status === 'error') && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div
            className="w-full max-w-lg rounded-xl p-6 shadow-xl"
            style={{ backgroundColor: '#1f1d1d', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h2 className="text-lg font-semibold text-white mb-1">Generate Page with AI</h2>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Describe the page you want to create. The AI will pick the right blocks and fill them with content.
            </p>

            <textarea
              className="w-full rounded-lg p-3 text-sm text-white resize-none outline-none focus:ring-1"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                minHeight: '120px',
              }}
              placeholder="e.g. A landing page for our BIM Management platform targeting construction companies. Include pricing, features, and a demo CTA."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={aiState.status === 'loading'}
            />

            {aiState.status === 'error' && (
              <p className="text-sm text-red-400 mt-2">{aiState.message}</p>
            )}

            <div className="flex gap-3 mt-4 justify-end">
              <button
                className="btn btn-ghost btn-sm"
                onClick={closeModal}
                disabled={aiState.status === 'loading'}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={generate}
                disabled={aiState.status === 'loading' || !prompt.trim()}
              >
                {aiState.status === 'loading' ? (
                  <>
                    <span className="loading loading-spinner loading-xs" />
                    Generating…
                  </>
                ) : (
                  'Generate & Save as Draft'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PagesPage
