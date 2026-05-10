'use client'

import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import DynamicText from '@/components/common/Forms/DynamicText'
import type { DynamicPageStatus } from '@/types/content/PageTypes'
import SeoModal from './SeoModal'
import BackupModal from './BackupModal'
import TranslationModal from './TranslationModal'
import { useEditorStore } from './stores/editorStore'

interface Props {
  onSave: () => void
  onCancel: () => void
}

export default function EditorTopBar({ onSave, onCancel }: Props) {
  const {
    title, setTitle,
    slug, setSlug,
    status, setStatus,
    saving, loading,
    setSeoOpen, setBackupOpen, setTranslationOpen,
    activeLang,
    translationCache,
    setTranslationTitle,
    setTranslationDescription,
    saveTranslation,
  } = useEditorStore()

  const isTranslationMode = activeLang !== 'en'
  const translationEntry = isTranslationMode ? translationCache[activeLang] : null
  const activeLangLabel = activeLang.toUpperCase()

  return (
    <>
      <div className="flex items-center justify-between px-6 py-3 border-b bg-base-200">
        <div className="flex items-center space-x-1">
          {isTranslationMode ? (
            <>
              <DynamicText
                value={translationEntry?.title ?? ''}
                setValue={(v) => setTranslationTitle(activeLang, v)}
                placeholder={`${activeLangLabel} Title`}
                className="font-bold"
              />
              <DynamicText
                value={translationEntry?.description ?? ''}
                setValue={(v) => setTranslationDescription(activeLang, v)}
                placeholder={`${activeLangLabel} Description`}
              />
              <span className="px-2 py-1 text-xs rounded bg-secondary/15 text-secondary border border-secondary/30 font-mono">
                {activeLangLabel} Translation
              </span>
            </>
          ) : (
            <>
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
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70 h-10"
              >
                SEO
              </button>
              <button
                onClick={() => setBackupOpen(true)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70 h-10"
              >
                JSON
              </button>
            </>
          )}

          {/* Always visible — shows active lang badge when in translation mode */}
          <button
            onClick={() => setTranslationOpen(true)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 h-10 flex items-center gap-1.5 ${
              isTranslationMode
                ? 'bg-secondary/15 text-secondary border border-secondary/30'
                : 'bg-base-content/10 text-base-content/70'
            }`}
          >
            Translations
            {isTranslationMode && (
              <span className="font-mono font-bold">{activeLangLabel}</span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70 h-10"
          >
            Cancel
          </button>
          <button
            onClick={isTranslationMode ? saveTranslation : onSave}
            disabled={saving || loading}
            className="px-5 py-1.5 rounded-md text-sm font-medium transition-all disabled:opacity-50 flex-shrink-0 bg-primary text-primary-content h-10"
          >
            {saving ? 'Saving…' : isTranslationMode ? `Save ${activeLangLabel}` : 'Save'}
          </button>
        </div>
      </div>

      <SeoModal />
      <BackupModal />
      <TranslationModal />
    </>
  )
}
