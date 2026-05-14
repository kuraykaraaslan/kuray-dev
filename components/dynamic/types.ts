import type { ComponentType } from 'react'
export type { BlockData } from '@/types/content/PageTypes'

export type FieldType = 'text' | 'url' | 'textarea' | 'color' | 'boolean' | 'number' | 'select' | 'json' | 'img' | 'repeater' | 'icon' | 'rich-text'

/** Select option — either a plain string (value === label) or an object with distinct label/value */
export type FieldOption = string | { label: string; value: string }

export interface FieldSchema {
  label: string
  type: FieldType
  value?: unknown
  options?: FieldOption[]
  placeholder?: string
  uploadFolder?: string
  accept?: string
  /** Short hint rendered below the field label */
  description?: string
  /** Shows a required (*) indicator — purely visual, no runtime validation */
  required?: boolean
  /** Min value for `type: 'number'` */
  min?: number
  /** Max value for `type: 'number'` */
  max?: number
  /** Step for `type: 'number'` */
  step?: number
  /** Only render this field when the given prop key/value pairs match the current block props */
  showIf?: Record<string, unknown>
  /** Groups related fields under a collapsible section header */
  group?: string
  /** Sub-field definitions for `type: 'repeater'` rows (supports one level of nesting) */
  fields?: Record<string, FieldSchema>
}

export interface BlockDefinition {
  type: string
  label: string
  description: string
  category: string
  /** Emoji or icon name shown in the block picker */
  icon?: string
  /** Keywords used for search matching in addition to label */
  tags?: string[]
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
