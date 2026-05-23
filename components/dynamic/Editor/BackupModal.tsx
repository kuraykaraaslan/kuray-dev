'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import axiosInstance from '@/libs/axios'
import { HeadlessModal } from '@/components/common/Modal'
import { useEditorStore } from './stores/editorStore'
import { CURRENT_SCHEMA_VERSION } from '@/types/content/PageTypes'
import type { BlockData, DynamicPageStatus, PageMetadata } from '@/types/content/PageTypes'

interface TranslationEntry {
  title: string
  description: string
  sections: BlockData[]
}

interface PageBackup {
  title: string
  slug: string
  status: DynamicPageStatus
  description: string
  keywords: string[]
  metadata: PageMetadata
  sections: BlockData[]
  schemaVersion?: number
  translations?: Record<string, TranslationEntry>
}

type ImportResultRow = {
  status: 'created' | 'updated' | 'failed'
  slug: string
  title: string
  dynamicPageId?: string
  sectionsCount?: number
  repeaterConversions?: number
  translationsUpserted?: number
  aiApplied?: boolean
  error?: string
}

type ImportResponse = {
  summary: { total: number; created: number; updated: number; failed: number }
  results: ImportResultRow[]
}

export default function BackupModal() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [useAi, setUseAi] = useState(false)
  const [lastResult, setLastResult] = useState<ImportResultRow | null>(null)

  const {
    backupOpen, setBackupOpen, pageId,
    title, slug, status, description, keywords, metadata, sections,
    translationCache, loadPage,
  } = useEditorStore()

  const getBackupData = (): PageBackup => ({
    title, slug, status, description, keywords, metadata,
    sections: sections.map((s, i) => ({ ...s, order: i })),
    schemaVersion: CURRENT_SCHEMA_VERSION,
    translations: Object.keys(translationCache).length > 0 ? translationCache : undefined,
  })

  const handleExport = () => {
    const json = JSON.stringify(getBackupData(), null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `page-backup-${slug || 'untitled'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Backup downloaded')
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setLastResult(null)
    const file = e.target.files?.[0]
    if (!file) return

    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse backup file')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setImporting(true)
      const res = await axiosInstance.post<ImportResponse>('/api/dynamic-pages/import', {
        data: parsed,
        useAi,
      })
      const row = res.data.results[0]
      setLastResult(row)

      if (!row || row.status === 'failed') {
        setImportError(row?.error ?? 'Import failed')
        return
      }

      const verb = row.status === 'updated' ? 'updated' : 'created'
      toast.success(
        `Backup ${verb}: /${row.slug}` +
          (row.translationsUpserted ? ` · ${row.translationsUpserted} translation(s)` : ''),
      )

      // Navigate or reload depending on whether this is the currently-open page
      if (row.dynamicPageId && row.dynamicPageId !== pageId) {
        setBackupOpen(false)
        router.push(`/admin/pages/${row.dynamicPageId}`)
      } else if (row.dynamicPageId) {
        await loadPage(row.dynamicPageId)
        setBackupOpen(false)
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : 'Import failed')
      setImportError(msg)
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <HeadlessModal
      open={backupOpen}
      onClose={() => setBackupOpen(false)}
      title="JSON Backup"
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setBackupOpen(false)}
            className="px-4 py-2 rounded-md text-sm font-medium bg-base-content/10 text-base-content/70"
          >
            Close
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-content"
          >
            Export JSON
          </button>
        </div>
      }
    >
      <div className="space-y-5 p-1">
        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Import</h3>
          <p className="text-xs text-base-content/50">
            Select a previously exported JSON backup file. The file is sent through{' '}
            <code>/api/dynamic-pages/import</code>: the page is created if its slug is new, or
            updated in place if it already exists. Schema migrations and repeater normalization
            run automatically.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            disabled={importing}
            className="file-input file-input-bordered file-input-sm w-full"
          />
          <label className="flex items-center gap-2 text-xs cursor-pointer text-base-content/70">
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={useAi}
              onChange={(e) => setUseAi(e.target.checked)}
              disabled={importing}
            />
            AI safety pass after deterministic migration (slower)
          </label>
          {importing && (
            <p className="text-xs text-base-content/50 flex items-center gap-1">
              <span className="loading loading-spinner loading-xs" />
              Importing…
            </p>
          )}
          {importError && (
            <p className="text-xs text-error">{importError}</p>
          )}
          {lastResult && lastResult.status !== 'failed' && (
            <p className="text-xs text-success">
              {lastResult.status === 'created' ? '+ created' : '↻ updated'} {lastResult.title} ·{' '}
              <code>/{lastResult.slug}</code> · {lastResult.sectionsCount} blocks
              {lastResult.translationsUpserted ? ` · ${lastResult.translationsUpserted} translation(s)` : ''}
              {lastResult.repeaterConversions ? ` · ${lastResult.repeaterConversions} repeater conv.` : ''}
            </p>
          )}
        </section>

        <div className="divider my-0" />

        <section className="space-y-2">
          <h3 className="text-sm font-semibold text-base-content/60 uppercase tracking-wide">Current Page JSON</h3>
          <textarea
            readOnly
            value={JSON.stringify(getBackupData(), null, 2)}
            rows={14}
            className="textarea textarea-bordered w-full font-mono text-xs resize-none"
          />
        </section>
      </div>
    </HeadlessModal>
  )
}
