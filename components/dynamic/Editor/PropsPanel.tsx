'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import axiosInstance from '@/libs/axios'
import type { BlockData, FieldSchema } from '../types'
import { getCodeBlock } from '../BlockRegistry'
import { useEditorStore } from './stores/editorStore'
import RepeaterField from './RepeaterField'
import IconPicker from './IconPicker'

interface Props {
  block: BlockData | null
  onChange: (props: Record<string, unknown>) => void
  collapseButton?: React.ReactNode
}

export default function PropsPanel({ block, onChange, collapseButton }: Props) {
  const [localProps, setLocalProps] = useState<Record<string, unknown>>({})
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const blockDefs = useEditorStore((s) => s.blockDefs)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-l border-base-content/10 overflow-y-auto bg-base-200">
      <div className="px-4 py-4 border-b border-base-content/10 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-base-content">{def.label}</p>
          <p className="text-xs mt-0.5 text-base-content/40">
            {def.description}
          </p>
        </div>
        {collapseButton}
      </div>

      <div className="p-4 space-y-5">
        {Object.entries(schema).map(([key, field]) => (
          <div key={key}>
            <label className="block text-xs font-medium mb-1.5 text-base-content/55">
              {field.label}
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
              <div className="space-y-2">
                <textarea
                  value={(localProps[key] as string) ?? (field.value as string) ?? ''}
                  placeholder={field.placeholder || '<p>Enter HTML content…</p>'}
                  rows={6}
                  onChange={(e) => update(key, e.target.value)}
                  className={`${inputCls} resize-none font-mono text-xs`}
                />
                {(localProps[key] as string) && (
                  <div
                    className="p-2.5 rounded-md text-xs border border-base-content/10 bg-base-300/50 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: localProps[key] as string }}
                  />
                )}
                <p className="text-[10px] text-base-content/30">HTML supported · live preview above</p>
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
                <span className="text-sm text-base-content/60">
                  Enabled
                </span>
              </label>
            )}

            {field.type === 'number' && (
              <input
                type="number"
                value={(localProps[key] as number) ?? (field.value as number) ?? 0}
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
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}

            {field.type === 'json' && (
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
                    update(key, JSON.parse(e.target.value))
                  } catch {
                    const next = { ...localProps, [key]: e.target.value }
                    setLocalProps(next)
                  }
                }}
                className={`${inputCls} resize-none font-mono text-xs`}
              />
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
          </div>
        ))}
      </div>
    </div>
  )
}
