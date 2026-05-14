'use client'

import { useState } from 'react'
import axiosInstance from '@/libs/axios'
import type { FieldSchema, FieldOption } from '../types'
import IconPicker from './IconPicker'

const optVal = (o: FieldOption): string => (typeof o === 'string' ? o : o.value)
const optLabel = (o: FieldOption): string => (typeof o === 'string' ? o : o.label)

interface RepeaterFieldProps {
  propKey: string
  subFields: Record<string, FieldSchema>
  items: Record<string, unknown>[]
  onChange: (next: Record<string, unknown>[]) => void
  inputCls: string
  depth?: number
}

export default function RepeaterField({
  propKey,
  subFields,
  items,
  onChange,
  inputCls,
  depth = 0,
}: RepeaterFieldProps) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)

  const updateItem = (index: number, subKey: string, value: unknown) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [subKey]: value } : item)))
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const moveItem = (from: number, dir: -1 | 1) => {
    const to = from + dir
    if (to < 0 || to >= items.length) return
    const next = [...items]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  const addItem = () => {
    const empty = Object.fromEntries(
      Object.entries(subFields).map(([k, sf]) => [k, sf.type === 'repeater' ? [] : (sf.value ?? '')])
    )
    onChange([...items, empty])
  }

  const uploadItemImage = async (
    index: number,
    subKey: string,
    file: File,
    folder: string,
  ) => {
    const compositeKey = `${propKey}[${index}].${subKey}`
    setUploadingKey(compositeKey)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      const res = await axiosInstance.post('/api/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateItem(index, subKey, res.data.url)
    } finally {
      setUploadingKey(null)
    }
  }

  const btnCls =
    'px-1.5 py-0.5 text-xs rounded text-base-content/40 hover:text-base-content transition-colors disabled:opacity-20 disabled:cursor-not-allowed'

  // Label shown in the item header: first text/url/select subfield value, else "Item N"
  const headerLabel = (item: Record<string, unknown>, index: number): string => {
    for (const [k, sf] of Object.entries(subFields)) {
      if (['text', 'url', 'select'].includes(sf.type) && item[k]) {
        return String(item[k])
      }
    }
    return `Item ${index + 1}`
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <details key={index} className="group border border-base-content/15 rounded-lg overflow-hidden" open={index === items.length - 1}>
          {/* ── Item header ── */}
          <summary className="flex items-center justify-between px-3 py-2 bg-base-300/50 cursor-pointer list-none select-none">
            <span className="text-xs font-medium text-base-content/60 truncate flex-1 me-2">
              {headerLabel(item, index)}
            </span>
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                className={btnCls}
                onClick={(e) => { e.preventDefault(); moveItem(index, -1) }}
                disabled={index === 0}
                title="Move up"
              >↑</button>
              <button
                type="button"
                className={btnCls}
                onClick={(e) => { e.preventDefault(); moveItem(index, 1) }}
                disabled={index === items.length - 1}
                title="Move down"
              >↓</button>
              <button
                type="button"
                className={`${btnCls} hover:!text-error`}
                onClick={(e) => { e.preventDefault(); removeItem(index) }}
                title="Remove"
              >✕</button>
            </div>
          </summary>

          {/* ── Item body ── */}
          <div className="p-3 space-y-3 border-t border-base-content/10">
            {Object.entries(subFields).map(([subKey, subField]) => (
              <div key={subKey}>
                <label className="block text-[11px] text-base-content/40 mb-1">
                  {subField.label}
                </label>

                {(subField.type === 'text' || subField.type === 'url') && (
                  <input
                    type={subField.type}
                    value={(item[subKey] as string) || ''}
                    placeholder={subField.placeholder}
                    onChange={(e) => updateItem(index, subKey, e.target.value)}
                    className={inputCls}
                  />
                )}

                {subField.type === 'textarea' && (
                  <textarea
                    value={(item[subKey] as string) || ''}
                    placeholder={subField.placeholder}
                    rows={2}
                    onChange={(e) => updateItem(index, subKey, e.target.value)}
                    className={`${inputCls} resize-none`}
                  />
                )}

                {subField.type === 'number' && (
                  <input
                    type="number"
                    value={(item[subKey] as number) || 0}
                    onChange={(e) => updateItem(index, subKey, Number(e.target.value))}
                    className={inputCls}
                  />
                )}

                {subField.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(item[subKey])}
                      onChange={(e) => updateItem(index, subKey, e.target.checked)}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    <span className="text-xs text-base-content/60">Enabled</span>
                  </label>
                )}

                {subField.type === 'select' && (
                  <select
                    value={(item[subKey] as string) || ''}
                    onChange={(e) => updateItem(index, subKey, e.target.value)}
                    className={inputCls}
                  >
                    <option value="">— select —</option>
                    {subField.options?.map((opt) => (
                      <option key={optVal(opt)} value={optVal(opt)}>{optLabel(opt)}</option>
                    ))}
                  </select>
                )}

                {subField.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(item[subKey] as string) || '#000000'}
                      onChange={(e) => updateItem(index, subKey, e.target.value)}
                      className="w-9 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={(item[subKey] as string) || ''}
                      onChange={(e) => updateItem(index, subKey, e.target.value)}
                      className={`flex-1 ${inputCls}`}
                    />
                  </div>
                )}

                {subField.type === 'icon' && (
                  <IconPicker
                    value={(item[subKey] as string) || ''}
                    onChange={(name) => updateItem(index, subKey, name)}
                  />
                )}

                {subField.type === 'repeater' && subField.fields && depth < 1 && (
                  <RepeaterField
                    propKey={`${propKey}[${index}].${subKey}`}
                    subFields={subField.fields}
                    items={Array.isArray(item[subKey]) ? (item[subKey] as Record<string, unknown>[]) : []}
                    onChange={(next) => updateItem(index, subKey, next)}
                    inputCls={inputCls}
                    depth={depth + 1}
                  />
                )}

                {subField.type === 'img' && (
                  <div className="space-y-2">
                    {Boolean(item[subKey]) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item[subKey] as string}
                        alt={subField.label}
                        className="w-full h-16 object-contain rounded border border-base-content/10 bg-base-300"
                      />
                    )}
                    <input
                      type="text"
                      value={(item[subKey] as string) || ''}
                      placeholder="Paste image URL…"
                      onChange={(e) => updateItem(index, subKey, e.target.value)}
                      className={inputCls}
                    />
                    <input
                      type="file"
                      accept={subField.accept || 'image/*'}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        await uploadItemImage(index, subKey, file, subField.uploadFolder || 'content')
                        e.currentTarget.value = ''
                      }}
                      className={inputCls}
                    />
                    {uploadingKey === `${propKey}[${index}].${subKey}` && (
                      <p className="text-[11px] text-base-content/40">Uploading…</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </details>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 text-xs rounded-md border border-dashed border-primary/40 text-primary/60 hover:border-primary hover:text-primary transition-colors"
      >
        + Add Item
      </button>
    </div>
  )
}
