import type { ComponentType } from 'react'
export type { BlockData } from '@/types/content/PageTypes'

export type FieldType = 'text' | 'url' | 'textarea' | 'color' | 'boolean' | 'number' | 'select' | 'json' | 'img'

export interface FieldSchema {
  label: string
  type: FieldType
  value?: unknown
  options?: string[]
  placeholder?: string
  uploadFolder?: string
  accept?: string
}

export interface BlockDefinition {
  type: string
  label: string
  description: string
  category: string
  defaultProps: Record<string, unknown>
  schema: Record<string, FieldSchema>
  Component: ComponentType<Record<string, unknown>>
}

// DB-stored block definition (no Component — resolved at runtime)
export interface DynamicPageBlockRecord {
  blockId: string
  type: string
  label: string
  category: string
  description: string
  schema: Record<string, FieldSchema>
  defaultProps: Record<string, unknown>
  template: string
  isSystem: boolean
}
