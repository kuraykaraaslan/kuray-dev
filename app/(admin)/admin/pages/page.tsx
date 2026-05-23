'use client'

import { useState } from 'react'
import Table, {
  TableProvider,
  TableHeader,
  TableBody,
  TableFooter,
  type ColumnDef,
  type ActionButton,
} from '@/components/common/Forms/DynamicTable'
import axiosInstance from '@/libs/axios'
import AIModal from '@/components/dynamic/partials/AIModal'
import ImportJsonModal from '@/components/dynamic/partials/ImportJsonModal'

interface DynamicPageRow extends Record<string, unknown> {
  dynamicPageId: string
  title: string
  slug: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  updatedAt: string
}

const PagesPage = () => {
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

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
      href: (p) => `/${p.slug}`,
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
                  onClick: () => setAiModalOpen(true),
                  className: 'btn-ghost',
                },
                {
                  label: 'Import from JSON',
                  onClick: () => setImportModalOpen(true),
                  className: 'btn-ghost',
                },
              ]
            }
          />
          <TableBody />
          <TableFooter showingText="Showing" previousText="Previous" nextText="Next" />
        </Table>
      </TableProvider>

      <AIModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <ImportJsonModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />

    </>
  )
}

export default PagesPage
