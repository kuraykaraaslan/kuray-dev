'use client'

import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { HeadlessModal } from '@/components/common/Modal'
import { useEditorStore } from './stores/editorStore'
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
  translations?: Record<string, TranslationEntry>
}

export default function BackupModal() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const {
    backupOpen, setBackupOpen,
    title, slug, status, description, keywords, metadata, sections,
    translationCache,
    setTitle, setSlug, setStatus, setDescription, setKeywords, setMetadata,
  } = useEditorStore()

  const getBackupData = (): PageBackup => ({
    title, slug, status, description, keywords, metadata,
    sections: sections.map((s, i) => ({ ...s, order: i })),
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<PageBackup>

        if (!parsed.title || !parsed.slug || !Array.isArray(parsed.sections)) {
          throw new Error('Invalid backup format: missing required fields')
        }

        setTitle(parsed.title)
        setSlug(parsed.slug)
        if (parsed.status) setStatus(parsed.status)
        if (parsed.description !== undefined) setDescription(parsed.description)
        if (Array.isArray(parsed.keywords)) setKeywords(parsed.keywords)
        if (parsed.metadata) setMetadata(parsed.metadata)

        const restoredTranslations = parsed.translations ?? {}
        const savedLangs = Object.keys(restoredTranslations)

        useEditorStore.setState({
          sections: parsed.sections.map((s, i) => ({ ...s, order: i })),
          enSections: parsed.sections.map((s, i) => ({ ...s, order: i })),
          translationCache: restoredTranslations,
          savedLangs,
          activeLang: 'en',
          selectedId: null,
        })

        toast.success('Backup imported successfully')
        setBackupOpen(false)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to parse backup file'
        setImportError(msg)
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
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
            Select a previously exported JSON backup file. This will replace the current page content.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImport}
            className="file-input file-input-bordered file-input-sm w-full"
          />
          {importError && (
            <p className="text-xs text-error">{importError}</p>
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
