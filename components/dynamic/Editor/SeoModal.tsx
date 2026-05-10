'use client'

import { HeadlessModal } from '@/components/common/Modal'
import DynamicText from '@/components/common/Forms/DynamicText'
import ImageLoad from '@/components/common/UI/Images/ImageLoad'
import type { PageMetadata } from '@/types/content/PageTypes'
import { DefaultPageMetadata } from '@/types/content/PageTypes'
import { useEditorStore } from './stores/editorStore'

export default function SeoModal() {
  const {
    seoOpen, setSeoOpen,
    description, setDescription,
    keywords, setKeywords,
    metadata, setMetadata,
  } = useEditorStore()

  const meta = metadata ?? DefaultPageMetadata

  const updateMeta = (key: keyof NonNullable<PageMetadata>, value: string) =>
    setMetadata({ ...meta, [key]: value })

  return (
    <HeadlessModal open={seoOpen} onClose={() => setSeoOpen(false)} title="SEO Settings" size="lg">
      <div className="space-y-6 p-1">

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Page Info</h3>
          <DynamicText
            label="Description"
            value={description}
            setValue={setDescription}
            isTextarea
          />
          <DynamicText
            label="Keywords"
            value={keywords.join(', ')}
            setValue={(v) => setKeywords(v.split(',').map((s) => s.trim()).filter(Boolean))}
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
          <ImageLoad
            label="OG Image"
            image={meta?.ogImage ?? ''}
            setImage={(v) => updateMeta('ogImage', v)}
            uploadFolder="og"
            aspect={1200 / 630}
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
