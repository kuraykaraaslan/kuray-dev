'use client'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HeadlessModal } from '@/components/common/Modal'
import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import axiosInstance from '@/libs/axios'
import { LANG_NAMES, getLangFlagUrl, type AppLanguage } from '@/types/common/I18nTypes'
import { deserializeAIModel } from '@/types/features/AITypes'
import { useEditorStore } from './stores/editorStore'
import type { BlockData } from '@/types/content/PageTypes'

interface Props {
  open: boolean
  onClose: () => void
  targetLang: string
}

const AddTranslationModal = ({ open, onClose, targetLang }: Props) => {
  const { t } = useTranslation()
  const { pageId, savedLangs, addTranslation, setActiveLang } = useEditorStore()

  const [mode, setMode] = useState<'choose' | 'ai'>('choose')
  const [sourceLang, setSourceLang] = useState<string>('en')
  const [aiModel, setAiModel] = useState<string>('')
  const [translating, setTranslating] = useState(false)
  const [error, setError] = useState('')

  const availableSourceLangs = ['en', ...savedLangs.filter((l) => l !== targetLang)]

  const handleClose = () => {
    setMode('choose')
    setError('')
    setSourceLang('en')
    setAiModel('')
    onClose()
  }

  const handleScratch = () => {
    const store = useEditorStore.getState()
    addTranslation(targetLang, {
      title: store.title,
      description: store.description,
      sections: [...store.enSections],
    })
    setActiveLang(targetLang)
    handleClose()
  }

  const handleTranslate = async () => {
    if (!aiModel) { setError('Please select an AI model'); return }

    setTranslating(true)
    setError('')

    try {
      const modelInfo = deserializeAIModel(aiModel)
      if (!modelInfo) throw new Error(`Invalid AI model selection: ${aiModel}`)

      const res = await axiosInstance.post(
        `/api/dynamic-pages/${pageId}/translations/ai-translate`,
        {
          sourceLang: sourceLang || 'en',
          targetLang,
          model: modelInfo.modelName,
          provider: modelInfo.provider,
        }
      )

      const { title, description, sections } = res.data as {
        title: string
        description: string
        sections: BlockData[]
      }

      addTranslation(targetLang, { title, description, sections })
      setActiveLang(targetLang)
      handleClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? t('admin.translations.failed'))
    } finally {
      setTranslating(false)
    }
  }

  const effectiveSourceLang = sourceLang || availableSourceLangs[0] || 'en'

  const langOptions = availableSourceLangs.map((l) => ({
    value: l,
    label: LANG_NAMES[l] ?? l,
  }))

  return (
    <HeadlessModal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <img
            src={getLangFlagUrl(targetLang as AppLanguage)}
            alt=""
            className="w-5 h-5 rounded-full shrink-0 select-none opacity-60"
          />
          <span>Add {LANG_NAMES[targetLang] ?? targetLang} Translation</span>
        </div>
      }
      size="sm"
    >
      {mode === 'choose' ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-base-content/50 mb-1">{t('admin.translations.how_to_start')}</p>

          <button
            type="button"
            onClick={handleScratch}
            className="flex items-start gap-4 p-4 rounded-xl border border-base-content/10 hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
          >
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-base-content/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">{t('admin.translations.start_from_scratch')}</div>
              <div className="text-xs text-base-content/45 mt-0.5 leading-relaxed">
                {t('admin.translations.start_from_scratch_description')}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMode('ai')}
            className="flex items-start gap-4 p-4 rounded-xl border border-base-content/10 hover:border-secondary/40 hover:bg-secondary/5 transition-all text-left"
          >
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-base-200 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-base-content/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm">{t('admin.translations.translate_with_ai')}</div>
              <div className="text-xs text-base-content/45 mt-0.5 leading-relaxed">
                Auto-translate title, description and all block texts using AI
              </div>
            </div>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => { setMode('choose'); setError('') }}
            className="flex items-center gap-1.5 text-xs text-base-content/40 hover:text-base-content transition-colors w-fit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M5 12l7 7M5 12l7-7" />
            </svg>
            {t('admin.translations.back')}
          </button>

          <DynamicSelect
            label={t('admin.translations.translate_from')}
            options={langOptions}
            selectedValue={effectiveSourceLang}
            onValueChange={setSourceLang}
            placeholder={t('admin.translations.select_source_language')}
            searchable={langOptions.length > 4}
            portal
            renderOption={(opt) => (
              <span className="flex items-center gap-2.5">
                <img src={getLangFlagUrl(opt.value as AppLanguage)} alt="" className="w-5 h-5 rounded-full shrink-0 select-none" />
                <span className="flex-1">{opt.label}</span>
                <span className="text-xs font-mono text-base-content/40">{opt.value.toUpperCase()}</span>
              </span>
            )}
            renderSelected={(opt) => (
              <span className="flex items-center gap-2">
                <img src={getLangFlagUrl(opt.value as AppLanguage)} alt="" className="w-5 h-5 rounded-full shrink-0 select-none" />
                <span>{opt.label}</span>
              </span>
            )}
          />

          <DynamicSelect
            label={t('admin.translations.ai_model')}
            endpoint="/api/ai/models"
            dataKey="models"
            valueKey="id"
            labelKey="label"
            selectedValue={aiModel}
            onValueChange={setAiModel}
            placeholder={t('admin.translations.select_model')}
            portal
          />

          {effectiveSourceLang && (
            <div className="flex items-center gap-2 text-xs text-base-content/40">
              <span className="font-mono">{effectiveSourceLang.toUpperCase()}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
              <span className="font-mono">{targetLang.toUpperCase()}</span>
              <span className="ml-1 text-base-content/30">via {deserializeAIModel(aiModel)?.modelName ?? 'AI'}</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating || !effectiveSourceLang || !aiModel}
            className="btn btn-secondary btn-sm w-full gap-2"
          >
            {translating ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {t('admin.translations.translating')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                {t('admin.translations.translate_to', { lang: LANG_NAMES[targetLang] ?? targetLang })}
              </>
            )}
          </button>
        </div>
      )}
    </HeadlessModal>
  )
}

export default AddTranslationModal
