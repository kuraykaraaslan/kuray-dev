'use client'
import { createContext, useContext } from 'react'

export type EditorPreviewMode = 'mobile' | 'tablet' | 'desktop'

export const PreviewContext = createContext<EditorPreviewMode>('desktop')

export function usePreviewMode(): EditorPreviewMode {
  return useContext(PreviewContext)
}
