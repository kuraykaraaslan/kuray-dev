'use client'
import { useState } from 'react'
import { HeadlessModal } from '@/components/common/Modal'
import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import AddTranslationModal from './AddTranslationModal'
import { useEditorStore } from './stores/editorStore'
import { AVAILABLE_LANGUAGES, LANG_NAMES, getLangFlagUrl, type AppLanguage } from '@/types/common/I18nTypes'

export default function TranslationModal() {
  const {
    translationOpen, setTranslationOpen,
    activeLang, savedLangs, translationCache,
    setActiveLang, deleteTranslation, pageId,
  } = useEditorStore()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [addModalTarget, setAddModalTarget] = useState('')

  const addedLangs = Object.keys(translationCache).filter((l) => l !== 'en')
  const availableToAdd = AVAILABLE_LANGUAGES.filter((l) => l !== 'en' && !addedLangs.includes(l))
  const addOptions = availableToAdd.map((l) => ({ value: l, label: LANG_NAMES[l] ?? l }))

  const handleSelect = (lang: string) => {
    setActiveLang(lang)
    setTranslationOpen(false)
  }

  const handleAdd = (lang: string) => {
    if (!lang) return
    setAddModalTarget(lang)
    setAddModalOpen(true)
  }

  if (!pageId) return null

  return (
    <>
      <HeadlessModal
        open={translationOpen}
        onClose={() => setTranslationOpen(false)}
        title="Translations"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          {/* Progress */}
          <div className="flex items-center justify-between text-xs text-base-content/40">
            <span>{savedLangs.length} / {AVAILABLE_LANGUAGES.length - 1} translated</span>
            <div className="flex gap-0.5">
              {Array.from({ length: Math.min(AVAILABLE_LANGUAGES.length - 1, 24) }).map((_, i) => (
                <div key={i} className={`h-1 w-2 rounded-full ${i < savedLangs.length ? 'bg-success' : 'bg-base-content/15'}`} />
              ))}
            </div>
          </div>

          {/* Language pills */}
          <div className="flex flex-wrap gap-2">
            <div className="relative group">
              <button
                type="button"
                onClick={() => handleSelect('en')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all select-none ${
                  activeLang === 'en'
                    ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                    : 'bg-success/15 text-success border border-success/30 hover:bg-success/25'
                }`}
              >
                <img src={getLangFlagUrl('en')} alt="" className="w-4 h-4 rounded-full shrink-0 select-none" />
                <span className="font-mono tracking-wider">EN</span>
                <span className={`text-[9px] font-bold tracking-widest px-1 py-0.5 rounded ${
                  activeLang === 'en' ? 'bg-primary-content/20 text-primary-content' : 'bg-base-content/10 text-base-content/40'
                }`}>SRC</span>
              </button>
            </div>

            {addedLangs.map((lang) => {
              const isActive = activeLang === lang
              const isSaved = savedLangs.includes(lang)
              return (
                <div key={lang} className="relative group">
                  <button
                    type="button"
                    onClick={() => handleSelect(lang)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all select-none ${
                      isActive
                        ? 'bg-primary text-primary-content shadow-md shadow-primary/20'
                        : isSaved
                          ? 'bg-success/15 text-success border border-success/30 hover:bg-success/25'
                          : 'bg-base-content/5 text-base-content/60 border border-base-content/10 hover:bg-base-content/10'
                    }`}
                  >
                    <img src={getLangFlagUrl(lang as AppLanguage)} alt="" className="w-4 h-4 rounded-full shrink-0 select-none" />
                    <span className="font-mono tracking-wider">{lang.toUpperCase()}</span>
                    {isSaved && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-success/70" />}
                  </button>
                  <button
                    type="button"
                    title={`Remove ${LANG_NAMES[lang]}`}
                    onClick={() => deleteTranslation(lang)}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-error text-error-content text-xs font-bold hidden group-hover:flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          {/* Add language via DynamicSelect */}
          {availableToAdd.length > 0 && (
            <DynamicSelect
              options={addOptions}
              selectedValue=""
              onValueChange={handleAdd}
              placeholder="+ Add language"
              searchable
              portal
              clearable={false}
              renderOption={(opt) => (
                <span className="flex items-center gap-2.5">
                  <img src={getLangFlagUrl(opt.value as AppLanguage)} alt="" className="w-5 h-5 rounded-full shrink-0 select-none" />
                  <span className="flex-1">{opt.label}</span>
                  <span className="text-xs font-mono text-base-content/40">{opt.value.toUpperCase()}</span>
                </span>
              )}
              renderSelected={() => (
                <span className="text-base-content/40">+ Add language</span>
              )}
            />
          )}
        </div>
      </HeadlessModal>

      {addModalTarget && (
        <AddTranslationModal
          open={addModalOpen}
          onClose={() => { setAddModalOpen(false); setAddModalTarget('') }}
          targetLang={addModalTarget}
        />
      )}
    </>
  )
}
