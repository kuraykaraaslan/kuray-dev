'use client'

import { useState } from 'react'
import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import DynamicText from '@/components/common/Forms/DynamicText'
import type { DynamicPageStatus } from '@/types/content/PageTypes'
import SeoModal from './SeoModal'
import { useEditorStore } from './stores/editorStore'

interface Props {
  onSave: () => void
  onCancel: () => void
}

export default function EditorTopBar({ onSave, onCancel }: Props) {
  const [seoOpen, setSeoOpen] = useState(false)

  const {
    title,
    setTitle,
    slug,
    setSlug,
    status,
    setStatus,
    description,
    setDescription,
    keywords,
    setKeywords,
    metadata,
    setMetadata,
    saving,
    loading,
  } = useEditorStore()


  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-b bg-base-200">
        <div className="flex items-center space-x-1">
          <DynamicText
            value={title}
            setValue={setTitle}
            placeholder="Page Title"
            className="font-bold"
          />

          <DynamicText
            value={slug}
            setValue={setSlug}
            prefix='/'
            placeholder="slug"
          />
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
            onClick={() => setSeoOpen(true)}
            className="px-3 py-1.5 rounded-md font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70"
          >
            SEO
          </button>
        </div>

        <div className="flex items-center space-x-3">

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
      </div>

      <SeoModal
        open={seoOpen}
        onClose={() => setSeoOpen(false)}
        description={description}
        onDescriptionChange={setDescription}
        keywords={keywords}
        onKeywordsChange={setKeywords}
        metadata={metadata}
        onMetadataChange={setMetadata}
      />
    </>
  )
}
