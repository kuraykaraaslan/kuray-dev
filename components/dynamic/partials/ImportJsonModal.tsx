'use client'

import { useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/libs/axios'
import HeadlessModal from '../../common/Modal'
import {
  CURRENT_SCHEMA_VERSION,
  detectSchemaVersion,
} from '@/components/dynamic/migrations'
import { getCodeBlock } from '../utils/BlockRegistry'

type PagePreview = {
  title?: string
  slug?: string
  sectionsCount: number
}

type Preview = {
  ok: true
  mode: 'single' | 'multi'
  shape: 'array' | 'page' | 'wrapped' | 'pages-array' | 'pages-wrapped'
  fromVersion: number
  toVersion: number
  totalSections: number
  unknownTypes: string[]
  pages: PagePreview[]
}

type PreviewResult = Preview | { ok: false; error: string }

type ImportResultRow =
  | {
      status: 'created' | 'updated'
      slug: string
      title: string
      dynamicPageId: string
      sectionsCount: number
      repeaterConversions: number
      aiApplied: boolean
    }
  | { status: 'failed'; slug: string; title: string; error: string }

type ImportResponse = {
  summary: {
    total: number
    created: number
    updated: number
    failed: number
    fromVersion: number
    toVersion: number
  }
  results: ImportResultRow[]
}

function collectTypes(sections: unknown[], into: Set<string>) {
  for (const s of sections) {
    if (s && typeof s === 'object') {
      const t = (s as Record<string, unknown>).type
      if (typeof t === 'string') into.add(t)
    }
  }
}

function extractSingle(obj: Record<string, unknown>): { sections: unknown[]; meta: Record<string, unknown> } | null {
  if (Array.isArray(obj.sections)) return { sections: obj.sections, meta: obj }
  if (Array.isArray(obj.blocks)) return { sections: obj.blocks, meta: obj }
  return null
}

function previewJson(input: string): PreviewResult | null {
  if (!input.trim()) return null
  let raw: unknown
  try {
    raw = JSON.parse(input)
  } catch (e) {
    return { ok: false, error: 'Invalid JSON: ' + (e instanceof Error ? e.message : 'parse error') }
  }

  const types = new Set<string>()
  const pages: PagePreview[] = []
  let shape: Preview['shape']
  let mode: Preview['mode'] = 'single'

  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const obj = raw as Record<string, unknown>
    if (Array.isArray(obj.pages)) {
      mode = 'multi'
      shape = 'pages-wrapped'
      for (const p of obj.pages) {
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          const ex = extractSingle(p as Record<string, unknown>)
          if (ex) {
            collectTypes(ex.sections, types)
            pages.push({
              title: typeof ex.meta.title === 'string' ? ex.meta.title : undefined,
              slug: typeof ex.meta.slug === 'string' ? ex.meta.slug : undefined,
              sectionsCount: ex.sections.length,
            })
          }
        }
      }
    } else {
      const ex = extractSingle(obj)
      if (!ex) {
        return { ok: false, error: 'Could not find sections/blocks/pages array.' }
      }
      shape = obj.title || obj.slug ? 'page' : 'wrapped'
      collectTypes(ex.sections, types)
      pages.push({
        title: typeof ex.meta.title === 'string' ? ex.meta.title : undefined,
        slug: typeof ex.meta.slug === 'string' ? ex.meta.slug : undefined,
        sectionsCount: ex.sections.length,
      })
    }
  } else if (Array.isArray(raw)) {
    const looksLikePages =
      raw.length > 0 &&
      raw.every(
        (x) =>
          x &&
          typeof x === 'object' &&
          !Array.isArray(x) &&
          (Array.isArray((x as Record<string, unknown>).sections) ||
            Array.isArray((x as Record<string, unknown>).blocks)),
      )
    if (looksLikePages) {
      mode = 'multi'
      shape = 'pages-array'
      for (const p of raw) {
        const ex = extractSingle(p as Record<string, unknown>)
        if (ex) {
          collectTypes(ex.sections, types)
          pages.push({
            title: typeof ex.meta.title === 'string' ? ex.meta.title : undefined,
            slug: typeof ex.meta.slug === 'string' ? ex.meta.slug : undefined,
            sectionsCount: ex.sections.length,
          })
        }
      }
    } else {
      shape = 'array'
      collectTypes(raw, types)
      pages.push({ sectionsCount: raw.length })
    }
  } else {
    return { ok: false, error: 'JSON must be an object or array.' }
  }

  if (pages.length === 0) {
    return { ok: false, error: 'No pages or sections found in JSON.' }
  }

  const unknownTypes = Array.from(types).filter((t) => !getCodeBlock(t))
  const totalSections = pages.reduce((sum, p) => sum + p.sectionsCount, 0)

  return {
    ok: true,
    mode,
    shape,
    fromVersion: detectSchemaVersion(raw),
    toVersion: CURRENT_SCHEMA_VERSION,
    totalSections,
    unknownTypes,
    pages,
  }
}

export default function ImportJsonModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [jsonText, setJsonText] = useState('')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [versionOverride, setVersionOverride] = useState<string>('')
  const [useAi, setUseAi] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResponse | null>(null)

  const preview = useMemo(() => previewJson(jsonText), [jsonText])

  const isMulti = preview?.ok && preview.mode === 'multi'
  const firstPage = preview?.ok ? preview.pages[0] : undefined
  const effectiveTitle = isMulti ? '' : title || firstPage?.title || ''
  const effectiveSlug = isMulti ? '' : slug || firstPage?.slug || ''

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const text = await f.text()
    setJsonText(text)
  }

  const reset = () => {
    setJsonText('')
    setTitle('')
    setSlug('')
    setVersionOverride('')
    setUseAi(false)
    setError(null)
    setResult(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const close = () => {
    if (loading) return
    reset()
    onClose()
  }

  const runImport = async () => {
    setError(null)
    setResult(null)
    if (!preview || !preview.ok) {
      setError(preview && !preview.ok ? preview.error : 'Paste or upload a JSON first.')
      return
    }
    if (!isMulti && !effectiveTitle.trim()) {
      setError('Title is required for single-page import.')
      return
    }

    let data: unknown
    try {
      data = JSON.parse(jsonText)
    } catch {
      setError('Invalid JSON.')
      return
    }

    const fromVersion = versionOverride ? parseInt(versionOverride, 10) : undefined

    try {
      setLoading(true)
      const res = await axiosInstance.post<ImportResponse>('/api/dynamic-pages/import', {
        data,
        title: isMulti ? undefined : effectiveTitle.trim(),
        slug: isMulti ? undefined : effectiveSlug.trim(),
        fromVersion,
        useAi,
      })
      setLoading(false)
      setResult(res.data)

      // Single page success → jump straight to its editor
      if (!isMulti && res.data.summary.total === 1) {
        const r = res.data.results[0]
        if (r && r.status !== 'failed') {
          reset()
          onClose()
          router.push(`/admin/pages/${r.dynamicPageId}`)
          return
        }
      }
      // Multi-page → keep modal open showing the summary; user can close it manually
      router.refresh()
    } catch (e: unknown) {
      setLoading(false)
      const msg =
        (e as { response?: { data?: { error?: string; message?: string } } })?.response?.data?.error ??
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (e instanceof Error ? e.message : 'Import failed')
      setError(msg)
    }
  }

  return (
    <HeadlessModal open={open} onClose={close}>
      <div
        className="w-full max-w-2xl rounded-xl p-6 shadow-xl"
        style={{ backgroundColor: '#1f1d1d', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h2 className="text-lg font-semibold text-white mb-1">Import Page(s) from JSON</h2>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Single page (<code>{'{ title, slug, sections }'}</code>), sections array, or multiple
          pages (<code>[...]</code> or <code>{'{ pages: [...] }'}</code>). Pages with a matching
          slug are updated in place; new slugs are created. Migration runs v
          {'{detected}'} → v{CURRENT_SCHEMA_VERSION}.
        </p>

        <div className="flex items-center gap-3 mb-3">
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={onFile}
            className="file-input file-input-sm file-input-bordered file-input-ghost"
            disabled={loading}
          />
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={reset}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        <textarea
          className="w-full rounded-lg p-3 text-xs text-white font-mono resize-y outline-none focus:ring-1"
          style={{
            backgroundColor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            minHeight: '180px',
          }}
          placeholder={'Single page:\n{ "title": "...", "slug": "...", "sections": [ ... ] }\n\nMultiple pages:\n[\n  { "title": "...", "slug": "about",   "sections": [ ... ] },\n  { "title": "...", "slug": "contact", "sections": [ ... ] }\n]\nor { "pages": [ ... ] }'}
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          disabled={loading}
        />

        {preview && !preview.ok && (
          <p className="text-sm text-red-400 mt-2">{preview.error}</p>
        )}

        {preview?.ok && (
          <div
            className="mt-3 rounded-lg p-3 text-xs space-y-1"
            style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <div style={{ color: '#4ade80' }}>
              Detected: <strong>{preview.pages.length}</strong> page{preview.pages.length === 1 ? '' : 's'} ·{' '}
              {preview.totalSections} block{preview.totalSections === 1 ? '' : 's'} total ·{' '}
              shape: <code>{preview.shape}</code> ·{' '}
              schema v{preview.fromVersion} → v{preview.toVersion}
            </div>
            {isMulti && (
              <ul className="mt-1 pl-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {preview.pages.slice(0, 6).map((p, i) => (
                  <li key={i} className="list-disc">
                    {p.title ?? '(no title)'} {p.slug ? <code>· /{p.slug}</code> : ''} ·{' '}
                    {p.sectionsCount} block{p.sectionsCount === 1 ? '' : 's'}
                  </li>
                ))}
                {preview.pages.length > 6 && (
                  <li className="list-none" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    …and {preview.pages.length - 6} more
                  </li>
                )}
              </ul>
            )}
            {preview.unknownTypes.length > 0 && (
              <div style={{ color: '#facc15' }}>
                Unknown block types ({preview.unknownTypes.length}): {preview.unknownTypes.join(', ')}.
                Saved but won&apos;t render until registered.
              </div>
            )}
          </div>
        )}

        {!isMulti && (
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="col-span-1">
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg p-2 text-sm text-white outline-none focus:ring-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                value={effectiveTitle}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
                disabled={loading}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Slug
              </label>
              <input
                type="text"
                className="w-full rounded-lg p-2 text-sm text-white outline-none focus:ring-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                value={effectiveSlug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="optional-slug"
                disabled={loading}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                From version
              </label>
              <input
                type="number"
                min={1}
                max={CURRENT_SCHEMA_VERSION}
                className="w-full rounded-lg p-2 text-sm text-white outline-none focus:ring-1"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
                value={versionOverride}
                onChange={(e) => setVersionOverride(e.target.value)}
                placeholder={String(preview?.ok ? preview.fromVersion : 1)}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {isMulti && (
          <div className="mt-4">
            <label className="block text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              From version (override — applies to all pages)
            </label>
            <input
              type="number"
              min={1}
              max={CURRENT_SCHEMA_VERSION}
              className="w-32 rounded-lg p-2 text-sm text-white outline-none focus:ring-1"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
              value={versionOverride}
              onChange={(e) => setVersionOverride(e.target.value)}
              placeholder={String(preview?.ok ? preview.fromVersion : 1)}
              disabled={loading}
            />
          </div>
        )}

        <label className="flex items-center gap-2 mt-3 text-xs cursor-pointer" style={{ color: 'rgba(255,255,255,0.7)' }}>
          <input
            type="checkbox"
            className="checkbox checkbox-xs"
            checked={useAi}
            onChange={(e) => setUseAi(e.target.checked)}
            disabled={loading}
          />
          AI safety pass — run an additional LLM normalization after deterministic migration (slower, useful for exotic shapes or unknown block types)
        </label>

        {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

        {result && (
          <div
            className="mt-3 rounded-lg p-3 text-xs"
            style={{ backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)' }}
          >
            <div className="mb-2" style={{ color: '#60a5fa' }}>
              Imported {result.summary.total} page{result.summary.total === 1 ? '' : 's'} —{' '}
              <span style={{ color: '#4ade80' }}>{result.summary.created} created</span>,{' '}
              <span style={{ color: '#facc15' }}>{result.summary.updated} updated</span>
              {result.summary.failed > 0 && (
                <>, <span style={{ color: '#f87171' }}>{result.summary.failed} failed</span></>
              )}
            </div>
            <ul className="space-y-1">
              {result.results.map((r, i) => (
                <li key={i} style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {r.status === 'failed' ? (
                    <span style={{ color: '#f87171' }}>
                      ✕ {r.title || r.slug || '(no title)'} — {r.error}
                    </span>
                  ) : (
                    <>
                      <span style={{ color: r.status === 'created' ? '#4ade80' : '#facc15' }}>
                        {r.status === 'created' ? '＋' : '↻'} {r.status}
                      </span>{' '}
                      {r.title} {r.slug && <code>/{r.slug}</code>} · {r.sectionsCount} blocks
                      {r.repeaterConversions > 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {' '}
                          · {r.repeaterConversions} repeater conv.
                        </span>
                      )}
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 mt-5 justify-end">
          <button className="btn btn-ghost btn-sm" onClick={close} disabled={loading}>
            {result ? 'Close' : 'Cancel'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={runImport}
            disabled={loading || !preview?.ok || (!isMulti && !effectiveTitle.trim())}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                Importing…
              </>
            ) : isMulti ? (
              `Import ${preview?.ok ? preview.pages.length : ''} Pages`
            ) : (
              'Import & Save as Draft'
            )}
          </button>
        </div>
      </div>
    </HeadlessModal>
  )
}
