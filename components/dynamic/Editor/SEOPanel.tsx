'use client'

import { useState, type KeyboardEvent } from 'react'

interface MetadataFields {
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterCard?: string
}

interface Props {
  description: string
  keywords: string[]
  metadata: MetadataFields
  onChangeDescription: (v: string) => void
  onChangeKeywords: (v: string[]) => void
  onChangeMetadata: (v: MetadataFields) => void
}

export default function SEOPanel({
  description,
  keywords,
  metadata,
  onChangeDescription,
  onChangeKeywords,
  onChangeMetadata,
}: Props) {
  const [kwInput, setKwInput] = useState('')

  const addKeyword = () => {
    const kw = kwInput.trim()
    if (!kw || keywords.includes(kw)) return
    onChangeKeywords([...keywords, kw])
    setKwInput('')
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addKeyword()
    }
  }

  const updateMeta = (key: keyof MetadataFields, value: string) => {
    onChangeMetadata({ ...metadata, [key]: value })
  }

  const inputCls = 'w-full px-3 py-2 rounded-md text-sm text-base-content outline-none bg-base-300 border border-base-content/10'

  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-l border-base-content/10 overflow-y-auto bg-base-200">
      <div className="px-4 py-4 border-b border-base-content/10">
        <p className="text-sm font-semibold text-base-content">SEO & Metadata</p>
        <p className="text-xs mt-0.5 text-base-content/40">
          Search engines and social media preview settings.
        </p>
      </div>

      <div className="p-4 space-y-5">
        {/* Meta Description */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-base-content/55">
            Meta Description
          </label>
          <textarea
            value={description}
            placeholder="Brief description for search engines…"
            rows={3}
            onChange={(e) => onChangeDescription(e.target.value)}
            className={`${inputCls} resize-none`}
          />
          <p className={`text-[11px] mt-1 ${description.length > 160 ? 'text-error' : 'text-base-content/30'}`}>
            {description.length}/160
          </p>
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-base-content/55">
            Keywords
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={kwInput}
              placeholder="Add keyword…"
              onChange={(e) => setKwInput(e.target.value)}
              onKeyDown={onKeyDown}
              className={`flex-1 ${inputCls}`}
            />
            <button
              onClick={addKeyword}
              className="px-3 py-2 rounded-md text-sm font-bold bg-primary text-primary-content"
            >
              +
            </button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {keywords.map((kw) => (
                <span
                  key={kw}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-base-300 text-base-content/70 border border-base-content/10"
                >
                  {kw}
                  <button
                    onClick={() => onChangeKeywords(keywords.filter((k) => k !== kw))}
                    className="leading-none hover:text-base-content text-base-content/40"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Open Graph */}
        <div className="pt-2 border-t border-base-content/10">
          <p className="text-xs font-semibold mb-3 text-base-content/55">
            Open Graph
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-base-content/40">OG Title</label>
              <input
                type="text"
                value={metadata.ogTitle ?? ''}
                placeholder="Override page title"
                onChange={(e) => updateMeta('ogTitle', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-base-content/40">OG Description</label>
              <textarea
                value={metadata.ogDescription ?? ''}
                placeholder="Override meta description"
                rows={2}
                onChange={(e) => updateMeta('ogDescription', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-base-content/40">OG Image URL</label>
              <input
                type="url"
                value={metadata.ogImage ?? ''}
                placeholder="https://…"
                onChange={(e) => updateMeta('ogImage', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Twitter Card */}
        <div className="pt-2 border-t border-base-content/10">
          <p className="text-xs font-semibold mb-3 text-base-content/55">
            Twitter Card
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1 text-base-content/40">Card Type</label>
              <select
                value={metadata.twitterCard ?? 'summary_large_image'}
                onChange={(e) => updateMeta('twitterCard', e.target.value)}
                className={inputCls}
              >
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
                <option value="app">app</option>
                <option value="player">player</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1 text-base-content/40">Twitter Title</label>
              <input
                type="text"
                value={metadata.twitterTitle ?? ''}
                placeholder="Override title"
                onChange={(e) => updateMeta('twitterTitle', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs mb-1 text-base-content/40">Twitter Description</label>
              <textarea
                value={metadata.twitterDescription ?? ''}
                placeholder="Override description"
                rows={2}
                onChange={(e) => updateMeta('twitterDescription', e.target.value)}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
