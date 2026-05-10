'use client'
import { useState } from 'react'
import LanguageBar from '@/components/admin/Features/Translations/LanguageBar'
import AddTranslationModal from './AddTranslationModal'
import { useEditorStore } from './stores/editorStore'

export default function TranslationBar() {
  const {
    activeLang,
    savedLangs,
    translationCache,
    setActiveLang,
    deleteTranslation,
    pageId,
  } = useEditorStore()

  const [modalOpen, setModalOpen] = useState(false)
  const [modalTargetLang, setModalTargetLang] = useState('')

  // Don't show translation bar for new (unsaved) pages
  if (!pageId) return null

  const addedLangs = Object.keys(translationCache).filter((l) => l !== 'en')

  const handleAdd = (lang: string) => {
    setModalTargetLang(lang)
    setModalOpen(true)
  }

  const handleDelete = (lang: string) => {
    deleteTranslation(lang)
  }

  return (
    <>
      <LanguageBar
        activeLang={activeLang}
        addedLangs={addedLangs}
        savedLangs={savedLangs}
        onSelect={setActiveLang}
        onAdd={handleAdd}
        onDelete={handleDelete}
        sourceLang="en"
      />

      {modalTargetLang && (
        <AddTranslationModal
          open={modalOpen}
          onClose={() => { setModalOpen(false); setModalTargetLang('') }}
          targetLang={modalTargetLang}
        />
      )}
    </>
  )
}
