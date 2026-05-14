'use client'
import type React from 'react'
import BlockBackground from './BlockBackground'
import { parseBgProps, BG_DEFAULT_PROPS, BG_SCHEMA_FIELDS } from './blockBg'
import type { BgProps } from './blockBg'
import type { FieldSchema } from './types'

export interface BaseBlockConfig {
  bgProps: BgProps
  sectionId: string
  blockHeight: number
}

interface BaseBlockProps extends BaseBlockConfig {
  className?: string
  style?: React.CSSProperties
  as?: 'section' | 'div'
  children: React.ReactNode
}

export const BASE_BLOCK_DEFAULT_PROPS: Record<string, unknown> = {
  blockHeight: 0,
  ...BG_DEFAULT_PROPS,
}

export const BASE_BLOCK_SCHEMA_FIELDS: Record<string, FieldSchema> = {
  sectionId:   { label: 'Section ID (anchor)', type: 'text',   placeholder: 'e.g. contact' },
  blockHeight: { label: 'Min Height (px)',      type: 'number', value: 0 },
  ...BG_SCHEMA_FIELDS,
}

export function parseBaseBlockProps(raw: Record<string, unknown>): BaseBlockConfig {
  return {
    bgProps:     parseBgProps(raw),
    sectionId:   (raw.sectionId   as string) || '',
    blockHeight: Number(raw.blockHeight)     || 0,
  }
}

export default function BaseBlock({
  bgProps,
  sectionId,
  blockHeight,
  className = '',
  style,
  as: Tag = 'section',
  children,
}: BaseBlockProps) {
  const heightStyle: React.CSSProperties = blockHeight > 0 ? { minHeight: blockHeight } : {}

  return (
    <Tag
      className={`relative ${className}`.trim()}
      id={sectionId || undefined}
      style={{ ...heightStyle, ...style }}
    >
      <BlockBackground {...bgProps} />
      {children}
    </Tag>
  )
}
