'use client'

import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import DynamicText from '@/components/common/Forms/DynamicText'
import type { DynamicPageStatus } from '@/types/content/PageTypes'
import SeoModal from './SeoModal'
import BackupModal from './BackupModal'
import TranslationModal from './TranslationModal'
import ShortcutsModal from './ShortcutsModal'
import { useEditorStore } from './stores/editorStore'
import type { PreviewMode } from './stores/editorStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMobileScreen, faTabletScreenButton, faDesktop, faRotateLeft, faRotateRight, faArrowUpRightFromSquare, faKeyboard } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const PREVIEW_MODES: { mode: PreviewMode; label: string; icon: IconDefinition }[] = [
  { mode: 'mobile', label: 'Mobile', icon: faMobileScreen },
  { mode: 'tablet', label: 'Tablet', icon: faTabletScreenButton },
  { mode: 'desktop', label: 'Desktop', icon: faDesktop },
]

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
    previewMode, setPreviewMode,
    isDirty,
    undo, redo,
    undoStack, redoStack,
    setShowShortcuts,
  } = useEditorStore()

  const isTranslationMode = activeLang !== 'en'
  const translationEntry = isTranslationMode ? translationCache[activeLang] : null
  const activeLangLabel = activeLang.toUpperCase()

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b bg-base-200 gap-3">
        <div className="flex items-center gap-1 flex-1 min-w-0">
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
              <span className="px-2 py-1 text-xs rounded bg-secondary/15 text-secondary border border-secondary/30 font-mono flex-shrink-0">
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

        {/* Preview mode toggle */}
        <div className="flex items-center gap-0.5 bg-base-300 rounded-lg p-0.5 flex-shrink-0">
          {PREVIEW_MODES.map(({ mode, label, icon }) => (
            <button
              key={mode}
              onClick={() => setPreviewMode(mode)}
              title={label}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                previewMode === mode
                  ? 'bg-base-100 text-base-content shadow-sm'
                  : 'text-base-content/40 hover:text-base-content/70'
              }`}
            >
              <FontAwesomeIcon icon={icon} className="w-4 h-4" />
            </button>
          ))}
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            title="Undo (Ctrl+Z)"
            className="w-8 h-8 flex items-center justify-center rounded-md text-xs text-base-content/50 hover:text-base-content hover:bg-base-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            title="Redo (Ctrl+Y)"
            className="w-8 h-8 flex items-center justify-center rounded-md text-xs text-base-content/50 hover:text-base-content hover:bg-base-300 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
          >
            <FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isDirty && (
            <span className="text-[10px] text-warning/70 font-medium">Unsaved</span>
          )}
          <button
            onClick={() => window.open(`/${slug}`, '_blank')}
            title="Preview page in new tab"
            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-shrink-0 bg-base-content/10 text-base-content/70 h-10"
          >
            <><FontAwesomeIcon icon={faArrowUpRightFromSquare} className="w-3 h-3 mr-1.5" />Preview</>
          </button>
          <button
            onClick={() => setShowShortcuts(true)}
            title="Keyboard shortcuts (Ctrl+/)"
            className="w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium bg-base-content/10 text-base-content/70 hover:text-base-content transition-colors flex-shrink-0"
          >
            <FontAwesomeIcon icon={faKeyboard} className="w-4 h-4" />
          </button>
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
      <ShortcutsModal />
    </>
  )
}
