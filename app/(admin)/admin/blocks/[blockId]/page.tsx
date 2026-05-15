'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
import { getCodeBlock } from '@/components/dynamic/utils/BlockRegistry'
import { PreviewContext } from '@/components/dynamic/partials/PreviewContext'
import TemplateBlockRenderer from '@/components/dynamic/partials/TemplateBlockRenderer'
import PropsPanel from '@/components/dynamic/Editor/PropsPanel'
import { useEditorStore, selectSelectedBlock } from '@/components/dynamic/Editor/stores/editorStore'
import type { PreviewMode } from '@/components/dynamic/Editor/stores/editorStore'

const PREVIEW_BLOCK_ID = 'block-preview'

const CATEGORIES = [
  'General', 'Hero', 'Content', 'CTA', 'Media',
  'Social Proof', 'Company', 'People', 'Custom',
]

const PREVIEW_WIDTHS: Record<PreviewMode, string> = {
  mobile: 'max-w-sm',
  tablet: 'max-w-2xl',
  desktop: 'max-w-none',
}

// ─── Shared top bar ────────────────────────────────────────────────────────────

function TopBar({
  label, type, category, description, source, previewMode, setPreviewMode, onBack, onPrev, onNext, actions,
}: {
  label: string; type: string; category: string; description?: string
  source: 'code' | 'db' | 'new'
  previewMode: PreviewMode; setPreviewMode: (m: PreviewMode) => void
  onBack: () => void
  onPrev?: (() => void) | null
  onNext?: (() => void) | null
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-base-content/10 bg-base-200 flex-shrink-0">
      <button onClick={onBack} className="btn btn-ghost btn-sm">← Back</button>
      <div className="flex items-center gap-1">
        <button onClick={() => onPrev?.()} disabled={!onPrev} className="btn btn-ghost btn-sm btn-square disabled:opacity-30" title="Previous block">‹</button>
        <button onClick={() => onNext?.()} disabled={!onNext} className="btn btn-ghost btn-sm btn-square disabled:opacity-30" title="Next block">›</button>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-base-content truncate">{label || 'New Block'}</span>
          {type && (
            <span className={`font-mono text-xs px-2 py-0.5 rounded ${
              source === 'code' ? 'bg-info/15 text-info' : 'bg-success/15 text-success'
            }`}>{type}</span>
          )}
          {category && <span className="text-xs px-2 py-0.5 rounded bg-base-300 text-base-content/50">{category}</span>}
          {source !== 'new' && (
            <span className="text-xs px-2 py-0.5 rounded bg-base-300 text-base-content/60 uppercase">{source}</span>
          )}
        </div>
        {description && <p className="text-xs text-base-content/40 mt-0.5 truncate">{description}</p>}
      </div>
      <div className="flex items-center gap-1 bg-base-300 rounded-lg p-1">
        {(['mobile', 'tablet', 'desktop'] as PreviewMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setPreviewMode(m)}
            className={`btn btn-xs ${previewMode === m ? 'btn-primary' : 'btn-ghost'}`}
          >
            {m === 'mobile' ? '📱' : m === 'tablet' ? '📟' : '🖥️'}
          </button>
        ))}
      </div>
      {actions}
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function SingleBlock() {
  const params = useParams<{ blockId: string }>()
  const blockId = params?.blockId ?? ''
  const router = useRouter()

  const isCreate = blockId === 'create'
  const mode = isCreate ? 'create' : 'edit'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSystem, setIsSystem] = useState(false)
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop')
  const [allBlockIds, setAllBlockIds] = useState<string[]>([])

  // Determined from API response — not from URL (avoids colon encoding issues)
  const [blockSource, setBlockSource] = useState<'code' | 'db' | null>(null)

  // block metadata
  const [type, setType] = useState('')
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [template, setTemplate] = useState('')
  const [schemaStr, setSchemaStr] = useState('{}')
  const [defaultPropsStr, setDefaultPropsStr] = useState('{}')

  const isCodeBlock = blockSource === 'code'

  // Fetch all block IDs for prev/next navigation
  useEffect(() => {
    axiosInstance.get('/api/dynamic-pages/block-definitions')
      .then(res => setAllBlockIds((res.data?.blocks ?? []).map((b: { blockId: string }) => b.blockId)))
      .catch(() => {})
  }, [])

  const currentIndex = isCreate ? -1 : allBlockIds.indexOf(blockId)
  const prevBlockId = currentIndex > 0 ? allBlockIds[currentIndex - 1] : null
  const nextBlockId = currentIndex >= 0 && currentIndex < allBlockIds.length - 1 ? allBlockIds[currentIndex + 1] : null

  // editor store wiring
  const loadBlockDefs = useEditorStore((s) => s.loadBlockDefs)
  const reset        = useEditorStore((s) => s.reset)
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)
  const block        = useEditorStore(selectSelectedBlock)

  const monoClass = 'w-full px-3 py-2 rounded-md text-sm font-mono text-base-content outline-none bg-base-100 border border-base-content/10 resize-none focus:border-primary/50 transition-colors'

  // Load block data and seed the editor store with a single preview block
  useEffect(() => {
    if (isCreate) {
      useEditorStore.setState({
        loading: false,
        sections: [{ id: PREVIEW_BLOCK_ID, type: 'custom', order: 0, props: {} }],
        selectedId: PREVIEW_BLOCK_ID,
        blockDefs: [],
      })
      loadBlockDefs()
      setLoading(false)
      return
    }

    let cancelled = false
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/dynamic-pages/block-definitions/${blockId}`)
        const b = res.data?.block
        if (!b || cancelled) return

        setBlockSource(b.source === 'code' ? 'code' : 'db')
        setType(b.type ?? '')
        setLabel(b.label ?? '')
        setCategory(b.category ?? 'General')
        setDescription(b.description ?? '')
        setTemplate(b.template ?? '')
        setSchemaStr(JSON.stringify(b.schema ?? {}, null, 2))
        setDefaultPropsStr(JSON.stringify(b.defaultProps ?? {}, null, 2))
        setIsSystem(b.isSystem ?? false)

        // Seed the editor store with a single block so PropsPanel works
        await loadBlockDefs()
        useEditorStore.setState({
          loading: false,
          sections: [{ id: PREVIEW_BLOCK_ID, type: b.type, order: 0, props: { ...(b.defaultProps ?? {}) } }],
          selectedId: PREVIEW_BLOCK_ID,
        })
      } catch (err: unknown) {
        toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load block')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
      reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockId])

  const handleSave = async () => {
    if (!type.trim()) { toast.error('Type is required'); return }
    if (!label.trim()) { toast.error('Label is required'); return }

    let parsedSchema: unknown
    let parsedDefaultProps: unknown
    try { parsedSchema = JSON.parse(schemaStr) } catch { toast.error('Schema is not valid JSON'); return }
    try { parsedDefaultProps = JSON.parse(defaultPropsStr) } catch { toast.error('Default Props is not valid JSON'); return }

    const body = { type, label, category, description, template, schema: parsedSchema, defaultProps: parsedDefaultProps }

    setSaving(true)
    try {
      if (mode === 'create') {
        await axiosInstance.post('/api/dynamic-pages/block-definitions', body)
        toast.success('Block created')
      } else {
        await axiosInstance.patch(`/api/dynamic-pages/block-definitions/${blockId}`, body)
        toast.success('Block updated')
      }
      router.push('/admin/blocks')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }


  // For DB/create blocks, keep defaultPropsStr in sync with editor store changes
  const parsedDefaultProps = useMemo(() => {
    try { return JSON.parse(defaultPropsStr) } catch { return {} }
  }, [defaultPropsStr])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  // ── Code block: live React Component preview ──────────────────────────────────
  if (isCodeBlock) {
    const codeDef = getCodeBlock(type)
    const Component = codeDef?.Component
    // Always merge codeDef.defaultProps so the block's default state is always visible
    const renderProps = { ...(codeDef?.defaultProps ?? {}), ...(block?.props ?? {}) }

    return (
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <TopBar
          label={label} type={type} category={category} description={description}
          source="code" previewMode={previewMode} setPreviewMode={setPreviewMode}
          onBack={() => router.push('/admin/blocks')}
          onPrev={prevBlockId ? () => router.push(`/admin/blocks/${prevBlockId}`) : null}
          onNext={nextBlockId ? () => router.push(`/admin/blocks/${nextBlockId}`) : null}
        />
        <div className="flex flex-1 min-h-0">
          {/* Left: rendered component */}
          <div className="flex-1 overflow-auto bg-base-300">
            <div className={`transition-all duration-300 ${previewMode === 'desktop' ? 'w-full' : `mx-auto w-full ${PREVIEW_WIDTHS[previewMode]}`}`}>
              {Component ? (
                <PreviewContext.Provider value={previewMode}>
                  <Component {...renderProps} />
                </PreviewContext.Provider>
              ) : (
                <div className="flex items-center justify-center min-h-60 text-base-content/30 text-sm">
                  Yükleniyor…
                </div>
              )}
            </div>
          </div>
          {/* Right: editor PropsPanel */}
          <PropsPanel
            block={block ?? null}
            onChange={(props) => updateBlockProps(PREVIEW_BLOCK_ID, props)}
          />
        </div>
      </div>
    )
  }

  // ── DB block / create: template preview + edit form ──────────────────────────
  const previewProps = parsedDefaultProps

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <TopBar
        label={label} type={type} category={category} description={description}
        source={isCreate ? 'new' : 'db'} previewMode={previewMode} setPreviewMode={setPreviewMode}
        onBack={() => router.push('/admin/blocks')}
        onPrev={prevBlockId ? () => router.push(`/admin/blocks/${prevBlockId}`) : null}
        onNext={nextBlockId ? () => router.push(`/admin/blocks/${nextBlockId}`) : null}
        actions={
          <button onClick={handleSave} disabled={saving || isSystem} className="btn btn-primary btn-sm">
            {saving && <span className="loading loading-spinner loading-xs" />}
            {saving ? 'Saving…' : mode === 'create' ? 'Create' : 'Save'}
          </button>
        }
      />
      <div className="flex flex-1 min-h-0">
        {/* Left: template preview */}
        <div className="flex-1 overflow-auto bg-base-300">
          <div className={`transition-all duration-300 ${previewMode === 'desktop' ? 'w-full' : `mx-auto w-full ${PREVIEW_WIDTHS[previewMode]}`}`}>
            {template.trim() ? (
              <TemplateBlockRenderer template={template} props={previewProps} />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-80 gap-3 text-base-content/30">
                <span className="text-4xl">📄</span>
                <p className="text-sm">Template boş — sağdan HTML yaz, önizleme burada görünür.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: PropsPanel (for schema-driven fields) + raw edit form */}
        <div className="w-80 flex-shrink-0 border-l border-base-content/10 bg-base-200 overflow-y-auto flex flex-col">
          {/* PropsPanel for schema fields */}
          {block && Object.keys((() => { try { return JSON.parse(schemaStr) } catch { return {} } })()).length > 0 && (
            <PropsPanel
              block={block}
              onChange={(props) => {
                updateBlockProps(PREVIEW_BLOCK_ID, props)
              }}
            />
          )}

          {/* Raw edit form */}
          <div className="p-4 space-y-4 border-t border-base-content/10">
            {isSystem && (
              <div className="alert alert-warning text-sm py-2">System block — read-only.</div>
            )}
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">Type</label>
              <input className={monoClass} value={type} readOnly={mode === 'edit'}
                onChange={(e) => mode === 'create' && setType(e.target.value)} placeholder="MyBlock" />
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">Label</label>
              <input className={monoClass} value={label} readOnly={isSystem}
                onChange={(e) => !isSystem && setLabel(e.target.value)} placeholder="My Block" />
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">Category</label>
              <select className={`${monoClass} cursor-pointer`} value={category} disabled={isSystem}
                onChange={(e) => !isSystem && setCategory(e.target.value)}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">Description</label>
              <textarea className={`${monoClass} resize-none`} rows={2} value={description} readOnly={isSystem}
                onChange={(e) => !isSystem && setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">
                Template <span className="text-base-content/30 font-normal">{'{{field}}'}</span>
              </label>
              <textarea className={`${monoClass} font-mono text-xs resize-y`} rows={12} value={template} readOnly={isSystem}
                onChange={(e) => !isSystem && setTemplate(e.target.value)}
                placeholder={'<section>\n  <h1>{{title}}</h1>\n</section>'} />
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">
                Schema <span className="text-base-content/30 font-normal">JSON</span>
              </label>
              <textarea className={`${monoClass} font-mono text-xs resize-y`} rows={8} value={schemaStr} readOnly={isSystem}
                onChange={(e) => {
                  setSchemaStr(e.target.value)
                  try {
                    const parsed = JSON.parse(e.target.value)
                    useEditorStore.setState((s) => ({
                      blockDefs: s.blockDefs.map((d) => d.type === type ? { ...d, schema: parsed } : d),
                    }))
                  } catch { /* wait for valid JSON */ }
                }}
                placeholder={'{\n  "title": { "label": "Title", "type": "text" }\n}'} />
            </div>
            <div>
              <label className="text-xs font-medium text-base-content/55 block mb-1">
                Default Props <span className="text-base-content/30 font-normal">JSON</span>
              </label>
              <textarea className={`${monoClass} font-mono text-xs resize-y`} rows={6} value={defaultPropsStr} readOnly={isSystem}
                onChange={(e) => {
                  setDefaultPropsStr(e.target.value)
                  try {
                    const parsed = JSON.parse(e.target.value)
                    updateBlockProps(PREVIEW_BLOCK_ID, parsed)
                  } catch { /* wait for valid JSON */ }
                }}
                placeholder={'{\n  "title": "Hello"\n}'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
