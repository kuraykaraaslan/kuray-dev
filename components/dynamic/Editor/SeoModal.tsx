'use client'

import { HeadlessModal } from '@/components/common/Modal'
import DynamicText from '@/components/common/Forms/DynamicText'
import type { PageMetadata } from '@/types/content/PageTypes'
import { DefaultPageMetadata } from '@/types/content/PageTypes'

interface SeoModalProps {
  open: boolean
  onClose: () => void
  description: string
  onDescriptionChange: (v: string) => void
  keywords: string[]
  onKeywordsChange: (v: string[]) => void
  metadata: PageMetadata
  onMetadataChange: (v: PageMetadata) => void
}

export default function SeoModal({
  open, onClose,
  description, onDescriptionChange,
  keywords, onKeywordsChange,
  metadata, onMetadataChange,
}: SeoModalProps) {
  const meta = metadata ?? DefaultPageMetadata

  const updateMeta = (key: keyof NonNullable<PageMetadata>, value: string) =>
    onMetadataChange({ ...meta, [key]: value })

  return (
    <HeadlessModal open={open} onClose={onClose} title="SEO Settings" size="lg">
      <div className="space-y-6 p-1">

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Page Info</h3>
          <DynamicText
            label="Description"
            value={description}
            setValue={onDescriptionChange}
            isTextarea
          />
          <DynamicText
            label="Keywords"
            value={keywords.join(', ')}
            setValue={(v) => onKeywordsChange(v.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="keyword1, keyword2, keyword3"
          />
        </section>

        <div className="divider my-0" />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Open Graph</h3>
          <DynamicText
            label="OG Title"
            value={meta?.ogTitle ?? ''}
            setValue={(v) => updateMeta('ogTitle', v)}
          />
          <DynamicText
            label="OG Description"
            value={meta?.ogDescription ?? ''}
            setValue={(v) => updateMeta('ogDescription', v)}
            isTextarea
          />
          <DynamicText
            label="OG Image URL"
            value={meta?.ogImage ?? ''}
            setValue={(v) => updateMeta('ogImage', v)}
            placeholder="https://..."
          />
        </section>

        <div className="divider my-0" />

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Twitter Card</h3>
          <DynamicText
            label="Twitter Title"
            value={meta?.twitterTitle ?? ''}
            setValue={(v) => updateMeta('twitterTitle', v)}
          />
          <DynamicText
            label="Twitter Description"
            value={meta?.twitterDescription ?? ''}
            setValue={(v) => updateMeta('twitterDescription', v)}
            isTextarea
          />
          <DynamicText
            label="Card Type"
            value={meta?.twitterCard ?? ''}
            setValue={(v) => updateMeta('twitterCard', v)}
            placeholder="summary_large_image"
          />
        </section>

      </div>
    </HeadlessModal>
  )
}
