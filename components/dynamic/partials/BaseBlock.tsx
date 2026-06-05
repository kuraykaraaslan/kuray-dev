'use client'
import type React from 'react'
import BlockBackground from './BlockBackground'
import { parseBgProps, BG_DEFAULT_PROPS, BG_SCHEMA_FIELDS } from '../utils/BlockBg'
import type { BgProps } from '../utils/BlockBg'
import type { FieldSchema } from '../types'

export interface BaseBlockConfig {
  bgProps: BgProps
  sectionId: string
  blockHeight: number
  blockClass: string
}

interface BaseBlockProps extends BaseBlockConfig {
  style?: React.CSSProperties
  as?: 'section' | 'div'
  children: React.ReactNode
}

export const BASE_BLOCK_DEFAULT_PROPS: Record<string, unknown> = {
  blockClass:  '',
  blockHeight: 0,
  sectionId:   '',
  ...BG_DEFAULT_PROPS,
}

export const BASE_BLOCK_SCHEMA_FIELDS: Record<string, FieldSchema> = {
  blockClass:  { label: 'Section Classes (Tailwind)', type: 'text',   placeholder: 'bg-base-100 pt-16' },
  sectionId:   { label: 'Section ID (anchor)',         type: 'text',   placeholder: 'e.g. contact' },
  blockHeight: { label: 'Min Height (px)',              type: 'number', value: 0 },
  ...BG_SCHEMA_FIELDS,
}

export function parseBaseBlockProps(raw: Record<string, unknown>): BaseBlockConfig {
  return {
    bgProps:     parseBgProps(raw),
    sectionId:   (raw.sectionId   as string) || '',
    blockHeight: Number(raw.blockHeight)     || 0,
    blockClass:  (raw.blockClass  as string) || '',
  }
}

export default function BaseBlock({
  bgProps,
  sectionId,
  blockHeight,
  blockClass,
  style,
  as: Tag = 'section',
  children,
}: BaseBlockProps) {
  const heightStyle: React.CSSProperties = blockHeight > 0
    ? {
        height: blockHeight,
        minHeight: 200,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }
    : {}

  // content-visibility:auto defers paint/layout for off-screen sections.
  // containIntrinsicSize gives the browser an estimated height to avoid
  // scroll-jank when the section is skipped and later revealed.
  const contentVisStyle: React.CSSProperties = {
    contentVisibility: 'auto',
    containIntrinsicSize: '0 600px',
  }

  return (
    <Tag
      className={`relative ${blockClass}`.trim()}
      id={sectionId || undefined}
      style={{ ...contentVisStyle, ...style, ...heightStyle }}
    >
      <BlockBackground {...bgProps} />
      {children}
    </Tag>
  )
}
