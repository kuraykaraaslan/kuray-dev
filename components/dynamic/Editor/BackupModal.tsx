'use client'

import { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { HeadlessModal } from '@/components/common/Modal'
import { useEditorStore } from './stores/editorStore'
import { BlockDataSchema, CURRENT_SCHEMA_VERSION } from '@/types/content/PageTypes'
import { migrateSections, needsMigration } from '@/components/dynamic/migrations'
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

function validateSections(sections: unknown[]): { valid: BlockData[]; hasInvalid: boolean } {
  let hasInvalid = false
  const valid = sections.map((s, i) => {
    const result = BlockDataSchema.safeParse(s)
    if (result.success) return result.data
    hasInvalid = true
    // Return a best-effort block so the list is preserved
    const b = s as Record<string, unknown>
    return {
      id: String(b.id ?? `imported-${i}`),
      type: String(b.type ?? b.blockType ?? b.component ?? 'UnknownBlock'),
      order: typeof b.order === 'number' ? b.order : i,
      props: (b.props && typeof b.props === 'object' ? b.props : b) as Record<string, unknown>,
      hidden: typeof b.hidden === 'boolean' ? b.hidden : undefined,
      label: typeof b.label === 'string' ? b.label : undefined,
      className: typeof b.className === 'string' ? b.className : undefined,
    } as BlockData
  })
  return { valid, hasInvalid }
}

export default function BackupModal() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<{
    backup: PageBackup
    sections: BlockData[]
    schemaWarning?: string
    validationWarning?: boolean
  } | null>(null)
  const [migrating, setMigrating] = useState(false)

  const {
    backupOpen, setBackupOpen,
    title, slug, status, description, keywords, metadata, sections,
    translationCache,
    setTitle, setSlug, setStatus, setDescription, setKeywords, setMetadata,
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

  const applyImport = (backup: PageBackup, resolvedSections: BlockData[]) => {
    setTitle(backup.title)
    setSlug(backup.slug)
    if (backup.status) setStatus(backup.status)
    if (backup.description !== undefined) setDescription(backup.description)
    if (Array.isArray(backup.keywords)) setKeywords(backup.keywords)
    if (backup.metadata) setMetadata(backup.metadata)

    const restoredTranslations = backup.translations ?? {}
    const savedLangs = Object.keys(restoredTranslations)

    useEditorStore.setState({
      sections: resolvedSections.map((s, i) => ({ ...s, order: i })),
      enSections: resolvedSections.map((s, i) => ({ ...s, order: i })),
      translationCache: restoredTranslations,
      savedLangs,
      activeLang: 'en',
      selectedId: null,
      isDirty: true,
    })

    toast.success('Backup imported successfully')
    setPendingImport(null)
    setBackupOpen(false)
  }

  const handleAiMigrate = async () => {
    if (!pendingImport) return
    setMigrating(true)
    try {
      const res = await fetch('/api/dynamic-pages/ai-migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: pendingImport.sections }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'AI migration failed')
      applyImport(pendingImport.backup, data.sections as BlockData[])
      toast.success('AI migration complete')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI migration failed'
      toast.error(msg)
    } finally {
      setMigrating(false)
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null)
    setPendingImport(null)
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as Partial<PageBackup>

        if (!parsed.title || !parsed.slug || !Array.isArray(parsed.sections)) {
          throw new Error('Invalid backup format: missing required fields')
        }

        const importedVersion = parsed.schemaVersion ?? 1
        let rawSections = parsed.sections as BlockData[]
        let schemaWarning: string | undefined

        // Run known schema migrations first
        if (needsMigration(importedVersion)) {
          const migrated = migrateSections(rawSections, importedVersion)
          rawSections = migrated.sections
          schemaWarning = `Schema upgraded v${importedVersion} → v${CURRENT_SCHEMA_VERSION}`
        }

        // Validate individual blocks
        const { valid, hasInvalid } = validateSections(rawSections)

        const backup: PageBackup = {
          title: parsed.title,
          slug: parsed.slug,
          status: parsed.status ?? 'DRAFT',
          description: parsed.description ?? '',
          keywords: parsed.keywords ?? [],
          metadata: parsed.metadata,
          sections: valid,
          translations: parsed.translations,
        }

        if (hasInvalid) {
          // Show warning panel — let user choose to fix with AI or import as-is
          setPendingImport({ backup, sections: rawSections, schemaWarning, validationWarning: true })
        } else if (schemaWarning) {
          setPendingImport({ backup, sections: valid, schemaWarning })
        } else {
          // All good — apply immediately
          applyImport(backup, valid)
        }
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

          {pendingImport && (
            <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 space-y-3">
              {pendingImport.schemaWarning && (
                <p className="text-xs text-warning font-medium">
                  Schema version mismatch detected: {pendingImport.schemaWarning}
                </p>
              )}
              {pendingImport.validationWarning && (
                <p className="text-xs text-warning">
                  Some blocks don&apos;t match the current schema. You can import as-is or let AI fix the structure.
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={handleAiMigrate}
                  disabled={migrating}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold bg-primary text-primary-content disabled:opacity-50"
                >
                  {migrating ? 'Migrating…' : 'Fix with AI'}
                </button>
                <button
                  onClick={() => applyImport(pendingImport.backup, pendingImport.sections)}
                  disabled={migrating}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-base-content/10 text-base-content/70 disabled:opacity-50"
                >
                  Import as-is
                </button>
                <button
                  onClick={() => setPendingImport(null)}
                  disabled={migrating}
                  className="px-3 py-1.5 rounded-md text-xs font-medium text-base-content/50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
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
