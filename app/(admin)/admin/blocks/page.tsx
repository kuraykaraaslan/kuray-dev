'use client'

import Table, {
  TableProvider,
  TableHeader,
  TableBody,
  TableFooter,
  type ColumnDef,
  type ActionButton,
} from '@/components/common/Forms/DynamicTable'
import axiosInstance from '@/libs/axios'

interface BlockRow extends Record<string, unknown> {
  blockId: string
  type: string
  label: string
  category: string
  description: string
  isSystem: boolean
  source: 'code' | 'db'
}

const BlocksPage = () => {
  const columns: ColumnDef<BlockRow>[] = [
    { key: 'label', header: 'Label', accessor: (b) => b.label },
    {
      key: 'type',
      header: 'Type',
      accessor: (b) => <span className="font-mono text-xs text-base-content/60">{b.type}</span>,
    },
    { key: 'category', header: 'Category', accessor: (b) => b.category },
    {
      key: 'description',
      header: 'Description',
      accessor: (b) => <span className="text-xs text-base-content/50 line-clamp-1">{b.description}</span>,
    },
    {
      key: 'source',
      header: 'Source',
      accessor: (b) =>
        b.source === 'code' ? (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-info/15 text-info">Code</span>
        ) : (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-success/15 text-success">DB</span>
        ),
    },
  ]

  const actions: ActionButton<BlockRow>[] = [
    {
      label: 'Preview',
      href: (b) => `/admin/blocks/${b.blockId}`,
      className: 'btn-ghost btn-sm',
      hidden: (b) => b.source === 'db',
    },
    {
      label: 'Edit',
      href: (b) => `/admin/blocks/${b.blockId}`,
      className: 'btn-primary btn-sm',
      hidden: (b) => b.source === 'code',
    },
    {
      label: 'Delete',
      onClick: async (b) => {
        if (!confirm(`Delete block "${b.label}"?`)) return
        await axiosInstance.delete(`/api/dynamic-pages/block-definitions/${b.blockId}`)
      },
      className: 'text-danger btn-sm',
      hideOnMobile: true,
      hidden: (b) => b.source === 'code',
    },
  ]

  return (
    <TableProvider<BlockRow>
      apiEndpoint="/api/dynamic-pages/block-definitions"
      dataKey="blocks"
      idKey="blockId"
      columns={columns}
      actions={actions}
    >
      <Table>
        <TableHeader
          title="Block Definitions"
          searchPlaceholder="Search blocks…"
          buttons={[{ label: 'New Block', href: '/admin/blocks/create' }]}
        />
        <TableBody />
        <TableFooter showingText="Showing" previousText="Previous" nextText="Next" />
      </Table>
    </TableProvider>
  )
}

export default BlocksPage
