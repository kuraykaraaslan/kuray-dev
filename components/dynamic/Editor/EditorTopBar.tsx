'use client'

import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import type { DynamicPageStatus } from '@/types/content/PageTypes'

interface Props {
  title: string
  onTitleChange: (v: string) => void
  slug: string
  onSlugChange: (v: string) => void
  status: DynamicPageStatus
  onStatusChange: (v: DynamicPageStatus) => void
  saving: boolean
  loading: boolean
  onSave: () => void
  onCancel: () => void
}

export default function EditorTopBar({
  title, onTitleChange,
  slug, onSlugChange,
  status, onStatusChange,
  saving, loading,
  onSave, onCancel,
}: Props) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-base-content/10 flex-shrink-0 bg-base-200">
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Page title"
        className="flex-1 px-3 py-1.5 rounded-md text-sm text-base-content outline-none min-w-0 bg-base-300 border border-base-content/10"
      />

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs text-base-content/40">/</span>
        <input
          type="text"
          value={slug}
          onChange={(e) => onSlugChange(e.target.value)}
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
        onValueChange={(v) => onStatusChange(v as DynamicPageStatus)}
      />

      <button
        onClick={onCancel}
        className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70"
      >
        Cancel
      </button>

      <button
        onClick={onSave}
        disabled={saving || loading}
        className="px-5 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0 bg-primary text-primary-content"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}
