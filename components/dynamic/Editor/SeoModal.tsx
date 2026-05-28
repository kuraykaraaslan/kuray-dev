'use client'

import { useState, useEffect } from 'react'
import { HeadlessModal } from '@/components/common/Modal'
import DynamicText from '@/components/common/Forms/DynamicText'
import ImageLoad from '@/components/common/UI/Images/ImageLoad'
import type { PageMetadata } from '@/types/content/PageTypes'
import { DefaultPageMetadata } from '@/types/content/PageTypes'
import { useEditorStore } from './stores/editorStore'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'

// ── Character counter ─────────────────────────────────────────────────────────

function CharCounter({ value, ideal }: { value: string; ideal: [number, number] }) {
  const len = value.length
  const [min, max] = ideal
  const color = len === 0 ? 'text-base-content/25' : len < min ? 'text-warning' : len <= max ? 'text-success' : 'text-error'
  return <span className={`text-[10px] font-mono tabular-nums ${color}`}>{len} / {max}</span>
}

// ── Google SERP preview ───────────────────────────────────────────────────────

function SerpPreview({ title, description, slug }: { title: string; description: string; slug: string }) {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'yoursite.com'
  const truncTitle = title.length > 60 ? title.slice(0, 57) + '…' : title
  const truncDesc = description.length > 160 ? description.slice(0, 157) + '…' : description
  return (
    <div className="p-3 rounded-lg bg-base-300/40 border border-base-content/10 font-sans">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-4 h-4 rounded-full bg-base-content/20 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-base-content/70 truncate">{hostname}</p>
          <p className="text-[10px] text-base-content/40 truncate">{hostname}/{slug || 'page-slug'}</p>
        </div>
      </div>
      <p className="text-sm text-blue-500 leading-snug truncate mb-0.5">
        {truncTitle || <span className="italic text-base-content/30">No title set</span>}
      </p>
      <p className="text-[11px] text-base-content/50 leading-relaxed line-clamp-2 min-h-[2.5em]">
        {truncDesc || <span className="italic">No description set</span>}
      </p>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export default function SeoModal() {
  const {
    seoOpen, setSeoOpen,
    title, slug,
    sections,
    pageId,
    description, setDescription,
    keywords, setKeywords,
    metadata, setMetadata,
  } = useEditorStore()

  const [aiLoading, setAiLoading] = useState(false)

  const meta = metadata ?? DefaultPageMetadata

  const updateMeta = (key: keyof NonNullable<PageMetadata>, value: string) =>
    setMetadata({ ...meta, [key]: value })

  const autoOgUrl = pageId ? `/api/dynamic-pages/${pageId}/og.jpeg` : null

  useEffect(() => {
    if (seoOpen && autoOgUrl && !meta?.ogImage) {
      updateMeta('ogImage', autoOgUrl)
    }
  }, [seoOpen])

  const robotsStr = meta?.robots ?? ''
  const isNoIndex = robotsStr.includes('noindex')
  const isNoFollow = robotsStr.includes('nofollow')
  const updateRobots = (noindex: boolean, nofollow: boolean) => {
    const parts: string[] = []
    if (noindex) parts.push('noindex')
    if (nofollow) parts.push('nofollow')
    updateMeta('robots', parts.join(','))
  }

  const handleAiFill = async () => {
    if (!sections.length && !title) {
      toast.error('Add some content to the page first')
      return
    }
    setAiLoading(true)
    try {
      const res = await axiosInstance.post('/api/dynamic-pages/seo-ai', {
        title,
        sections: sections.map((s) => ({ type: s.type, props: s.props })),
      })
      const data = res.data
      if (data.description) setDescription(data.description)
      if (Array.isArray(data.keywords)) setKeywords(data.keywords)
      setMetadata({
        ...meta,
        ogTitle: data.ogTitle ?? meta?.ogTitle ?? '',
        ogDescription: data.ogDescription ?? meta?.ogDescription ?? '',
        ogImage: meta?.ogImage || (autoOgUrl ?? ''),
        twitterTitle: data.twitterTitle ?? meta?.twitterTitle ?? '',
        twitterDescription: data.twitterDescription ?? meta?.twitterDescription ?? '',
      })
      toast.success('SEO fields filled by AI')
    } catch {
      toast.error('AI SEO generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const aiBtn = (
    <button
      onClick={handleAiFill}
      disabled={aiLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {aiLoading ? <><span className="loading loading-spinner loading-xs" />Generating…</> : <>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2a1 1 0 0 1 .894.553l2.382 4.764 5.256.766a1 1 0 0 1 .554 1.705l-3.804 3.706.898 5.236a1 1 0 0 1-1.451 1.054L12 17.347l-4.729 2.437a1 1 0 0 1-1.451-1.054l.898-5.236L2.914 9.788a1 1 0 0 1 .554-1.705l5.256-.766L11.106 2.553A1 1 0 0 1 12 2z" />
        </svg>
        Fill with AI
      </>}
    </button>
  )

  return (
    <HeadlessModal open={seoOpen} onClose={() => setSeoOpen(false)} title="SEO Settings" size="lg">
      <div className="space-y-6 p-1">

        {/* Google SERP preview */}
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Search Preview</h3>
          <SerpPreview title={meta?.ogTitle || title} description={description} slug={slug} />
        </section>

        <div className="divider my-0" />

        {/* Page info */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Page Info</h3>
            {aiBtn}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-base-content/55">Meta Description</span>
              <CharCounter value={description} ideal={[120, 160]} />
            </div>
            <DynamicText value={description} setValue={setDescription} isTextarea />
          </div>

          <DynamicText
            label="Keywords"
            value={keywords.join(', ')}
            setValue={(v) => setKeywords(v.split(',').map((s) => s.trim()).filter(Boolean))}
            placeholder="keyword1, keyword2, keyword3"
          />

          <div>
            <p className="text-xs font-medium text-base-content/55 mb-1">Canonical URL</p>
            <DynamicText
              value={meta?.canonical ?? ''}
              setValue={(v) => updateMeta('canonical', v)}
              placeholder={typeof window !== 'undefined' ? `${window.location.origin}/${slug}` : `https://yoursite.com/${slug}`}
            />
          </div>

          <div>
            <p className="text-xs font-medium text-base-content/55 mb-2">Robots</p>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isNoIndex} onChange={(e) => updateRobots(e.target.checked, isNoFollow)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-base-content/60">noindex</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isNoFollow} onChange={(e) => updateRobots(isNoIndex, e.target.checked)} className="w-4 h-4 rounded accent-primary" />
                <span className="text-sm text-base-content/60">nofollow</span>
              </label>
            </div>
            {(isNoIndex || isNoFollow) && (
              <p className="mt-1.5 text-[11px] text-warning/70">
                {[isNoIndex && 'Page will not be indexed', isNoFollow && 'Links will not be followed'].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        </section>

        <div className="divider my-0" />

        {/* Open Graph */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Open Graph</h3>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-base-content/55">OG Title</span>
              <CharCounter value={meta?.ogTitle ?? ''} ideal={[40, 60]} />
            </div>
            <DynamicText value={meta?.ogTitle ?? ''} setValue={(v) => updateMeta('ogTitle', v)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-base-content/55">OG Description</span>
              <CharCounter value={meta?.ogDescription ?? ''} ideal={[120, 160]} />
            </div>
            <DynamicText value={meta?.ogDescription ?? ''} setValue={(v) => updateMeta('ogDescription', v)} isTextarea />
          </div>
          <ImageLoad label="OG Image" image={meta?.ogImage ?? ''} setImage={(v) => updateMeta('ogImage', v)} uploadFolder="og" width={1200} height={627} />
        </section>

        <div className="divider my-0" />

        {/* Twitter */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Twitter Card</h3>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-base-content/55">Twitter Title</span>
              <CharCounter value={meta?.twitterTitle ?? ''} ideal={[40, 60]} />
            </div>
            <DynamicText value={meta?.twitterTitle ?? ''} setValue={(v) => updateMeta('twitterTitle', v)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-base-content/55">Twitter Description</span>
              <CharCounter value={meta?.twitterDescription ?? ''} ideal={[120, 160]} />
            </div>
            <DynamicText value={meta?.twitterDescription ?? ''} setValue={(v) => updateMeta('twitterDescription', v)} isTextarea />
          </div>
          <DynamicText label="Card Type" value={meta?.twitterCard ?? ''} setValue={(v) => updateMeta('twitterCard', v)} placeholder="summary_large_image" />
        </section>

      </div>
    </HeadlessModal>
  )
}
