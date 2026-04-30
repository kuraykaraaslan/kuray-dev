import type { ComponentType } from 'react'

export interface BlockData {
  id: string
  type: string
  order: number
  props: Record<string, unknown>
}

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
