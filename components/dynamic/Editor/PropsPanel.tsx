'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Editor as TinyMCEEditor } from '@tinymce/tinymce-react'
import axiosInstance from '@/libs/axios'
import { useThemeStore } from '@/libs/zustand'
import type { BlockData, FieldSchema, FieldOption } from '../types'
import { getCodeBlock } from '../BlockRegistry'
import { useEditorStore } from './stores/editorStore'
import RepeaterField from './RepeaterField'
import IconPicker from './IconPicker'

const NEXT_PUBLIC_TINYMCE_API_KEY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY

interface Props {
  block: BlockData | null
  onChange: (props: Record<string, unknown>) => void
  collapseButton?: React.ReactNode
}

/** Resolves FieldOption to its value string */
const optVal = (o: FieldOption): string => (typeof o === 'string' ? o : o.value)
/** Resolves FieldOption to its label string */
const optLabel = (o: FieldOption): string => (typeof o === 'string' ? o : o.label)

/** Returns true when all showIf conditions match current props */
function shouldShow(field: FieldSchema, props: Record<string, unknown>): boolean {
  if (!field.showIf) return true
  return Object.entries(field.showIf).every(([k, v]) => props[k] === v)
}

export default function PropsPanel({ block, onChange, collapseButton }: Props) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({})
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [jsonErrors, setJsonErrors] = useState<Record<string, boolean>>({})
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (!block) return

    const codeDef = getCodeBlock(block.type)
    const dbDef = blockDefs.find((d) => d.type === block.type)
    const defaultProps = codeDef?.defaultProps ?? dbDef?.defaultProps ?? {}
    const schema = codeDef?.schema ?? dbDef?.schema ?? {}
    const nextProps = { ...defaultProps, ...(block.props ?? {}) }

    for (const [key, field] of Object.entries(schema as Record<string, FieldSchema>)) {
      if (nextProps[key] === undefined && field.value !== undefined) {
        nextProps[key] = field.value
      }
    }

    setLocalProps(nextProps)
    setJsonErrors({})
  }, [block?.id, block?.type, blockDefs])

  const update = useCallback((key: string, value: unknown) => {
    const next = { ...localProps, [key]: value }
    setLocalProps(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(next), 200)
  }, [localProps, onChange])

  if (!block) {
    return (
      <div className="w-72 flex-shrink-0 flex flex-col border-l border-base-content/10 bg-base-200">
        <div className="px-4 py-3 border-b border-base-content/10 flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest text-base-content/40">PROPERTIES</p>
          {collapseButton}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-center px-6 text-base-content/30">
            Click a block on the canvas to edit its properties.
          </p>
        </div>
      </div>
    )
  }

  const codeDef = getCodeBlock(block.type)
  const dbDef = blockDefs.find((d) => d.type === block.type)
  const def = codeDef ?? dbDef
  if (!def) return null

  const schema = (codeDef?.schema ?? dbDef?.schema ?? {}) as Record<string, FieldSchema>

  const uploadImage = async (key: string, file: File, uploadFolder = 'content') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', uploadFolder)

    setUploadingKey(key)
    try {
      const response = await axiosInstance.post('/api/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      update(key, response.data.url)
    } finally {
      setUploadingKey(null)
    }
  }

  const inputCls = 'w-full px-3 py-2 rounded-md text-sm text-base-content outline-none bg-base-300 border border-base-content/10'

  // Partition schema into ungrouped and groups
  const visibleEntries = Object.entries(schema).filter(([, f]) => shouldShow(f, localProps))
  const ungrouped = visibleEntries.filter(([, f]) => !f.group)
  const groupMap = visibleEntries
    .filter(([, f]) => f.group)
    .reduce<Record<string, [string, FieldSchema][]>>((acc, entry) => {
      const g = entry[1].group!
      if (!acc[g]) acc[g] = []
      acc[g].push(entry)
      return acc
    }, {})

  const renderField = (key: string, field: FieldSchema) => (
    <div key={key}>
      <label className="block text-xs font-medium mb-1.5 text-base-content/55">
        {field.label}
        {field.required && <span className="text-error ml-0.5">*</span>}
      </label>

      {field.type === 'text' && (
        <input
          type="text"
          value={(localProps[key] as string) ?? (field.value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => update(key, e.target.value)}
          className={inputCls}
        />
      )}

      {field.type === 'url' && (
        <input
          type="url"
          value={(localProps[key] as string) ?? (field.value as string) ?? ''}
          placeholder={field.placeholder}
          onChange={(e) => update(key, e.target.value)}
          className={inputCls}
        />
      )}

      {field.type === 'img' && (
        <div className="space-y-3">
          {typeof localProps[key] === 'string' && (localProps[key] as string) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={localProps[key] as string}
              alt={field.label}
              className="w-full h-32 object-cover rounded-md border border-base-content/10"
            />
          ) : (
            <div className="w-full h-32 rounded-md border border-base-content/10 flex items-center justify-center text-xs text-center px-3 text-base-content/35">
              No image selected
            </div>
          )}

          <input
            type="text"
            value={(localProps[key] as string) ?? (field.value as string) ?? ''}
            placeholder={field.placeholder || 'Paste image URL or upload a file'}
            onChange={(e) => update(key, e.target.value)}
            className={inputCls}
          />

          <input
            type="file"
            accept={field.accept || 'image/*'}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              await uploadImage(key, file, field.uploadFolder || 'content')
              e.currentTarget.value = ''
            }}
            className={inputCls}
          />

          <p className="text-[11px] text-base-content/35">
            {uploadingKey === key ? 'Uploading...' : 'Upload a file to S3 or keep using a URL.'}
          </p>
        </div>
      )}

      {field.type === 'textarea' && (
        <textarea
          value={(localProps[key] as string) ?? (field.value as string) ?? ''}
          placeholder={field.placeholder}
          rows={3}
          onChange={(e) => update(key, e.target.value)}
          className={`${inputCls} resize-none`}
        />
      )}

      {field.type === 'rich-text' && (
        <div className="space-y-1">
          <TinyMCEEditor
            key={`${theme}-${block.id}-${key}`}
            id={`tinymce-props-${block.id}-${key}`}
            apiKey={NEXT_PUBLIC_TINYMCE_API_KEY}
            value={(localProps[key] as string) ?? ''}
            onEditorChange={(v) => update(key, v)}
            init={{
              height: 260,
              menubar: false,
              skin: isDark ? 'oxide-dark' : 'oxide',
              content_css: isDark ? 'dark' : 'default',
              plugins: ['lists', 'link', 'codesample', 'autolink'],
              toolbar: 'bold italic | bullist numlist | link | codesample | removeformat',
              content_style: 'body { font-family: inherit; font-size: 13px; }',
            }}
          />
        </div>
      )}

      {field.type === 'color' && (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(localProps[key] as string) || '#000000'}
            onChange={(e) => update(key, e.target.value)}
            className="w-9 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent"
          />
          <input
            type="text"
            value={(localProps[key] as string) ?? ''}
            onChange={(e) => update(key, e.target.value)}
            className={`flex-1 ${inputCls}`}
          />
          {(localProps[key] as string) && (
            <button
              onClick={() => update(key, '')}
              className="text-xs px-2 py-1 rounded text-base-content/40 hover:text-error transition-colors"
              title="Clear color"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {field.type === 'boolean' && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={(localProps[key] as boolean) ?? (field.value as boolean) ?? false}
            onChange={(e) => update(key, e.target.checked)}
            className="w-4 h-4 rounded accent-primary"
          />
          <span className="text-sm text-base-content/60">Enabled</span>
        </label>
      )}

      {field.type === 'number' && (
        <input
          type="number"
          value={(localProps[key] as number) ?? (field.value as number) ?? 0}
          min={field.min}
          max={field.max}
          step={field.step}
          onChange={(e) => update(key, Number(e.target.value))}
          className={inputCls}
        />
      )}

      {field.type === 'select' && (
        <select
          value={(localProps[key] as string) ?? (field.value as string) ?? ''}
          onChange={(e) => update(key, e.target.value)}
          className={inputCls}
        >
          {field.options?.map((opt) => (
            <option key={optVal(opt)} value={optVal(opt)}>
              {optLabel(opt)}
            </option>
          ))}
        </select>
      )}

      {field.type === 'json' && (
        <div className="space-y-1">
          <textarea
            value={
              typeof localProps[key] === 'string'
                ? (localProps[key] as string)
                : JSON.stringify(localProps[key], null, 2)
            }
            placeholder={field.placeholder}
            rows={8}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value)
                update(key, parsed)
                setJsonErrors((prev) => ({ ...prev, [key]: false }))
              } catch {
                setJsonErrors((prev) => ({ ...prev, [key]: true }))
                setLocalProps((prev) => ({ ...prev, [key]: e.target.value }))
              }
            }}
            className={`${inputCls} resize-none font-mono text-xs ${jsonErrors[key] ? 'border-error/60' : ''}`}
          />
          {jsonErrors[key] && (
            <p className="text-[11px] text-error">Invalid JSON — changes won&apos;t be saved until fixed.</p>
          )}
        </div>
      )}

      {field.type === 'icon' && (
        <IconPicker
          value={(localProps[key] as string) || ''}
          onChange={(name) => update(key, name)}
        />
      )}

      {field.type === 'repeater' && field.fields && (
        <RepeaterField
          propKey={key}
          subFields={field.fields}
          items={
            Array.isArray(localProps[key])
              ? (localProps[key] as Record<string, unknown>[])
              : []
          }
          onChange={(next) => update(key, next)}
          inputCls={inputCls}
        />
      )}

      {field.description && (
        <p className="mt-1.5 text-[11px] text-base-content/35 leading-snug">{field.description}</p>
      )}
    </div>
  )

  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-l border-base-content/10 overflow-y-auto bg-base-200">
      <div className="px-4 py-4 border-b border-base-content/10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-base-content">{def.label}</p>
          <p className="text-xs mt-0.5 text-base-content/40">{def.description}</p>
        </div>
        {collapseButton}
      </div>

      <div className="p-4 space-y-5">
        {/* Ungrouped fields */}
        {ungrouped.map(([key, field]) => renderField(key, field))}

        {/* Grouped fields */}
        {Object.entries(groupMap).map(([groupName, entries]) => (
          <details key={groupName} className="group/group border border-base-content/10 rounded-lg overflow-hidden" open>
            <summary className="flex items-center justify-between px-3 py-2 bg-base-300/50 cursor-pointer list-none select-none">
              <span className="text-xs font-semibold uppercase tracking-widest text-base-content/50">{groupName}</span>
              <svg
                width="10" height="10" viewBox="0 0 12 12" fill="none"
                className="text-base-content/30 transition-transform group-open/group:rotate-90"
              >
                <path d="M4 2.5L7.5 6L4 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <div className="p-3 space-y-4 border-t border-base-content/10">
              {entries.map(([key, field]) => renderField(key, field))}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
