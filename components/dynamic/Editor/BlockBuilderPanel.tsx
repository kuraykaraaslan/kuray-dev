'use client'

import { useState, useRef } from 'react'
import axiosInstance from '@/libs/axios'
import type { BlockData } from '../types'
import type { CustomFieldSchema } from '../Blocks/CustomBlock'

interface Props {
  block: BlockData
  onChange: (props: Record<string, unknown>) => void
}

type Tab = 'ai' | 'fields' | 'template' | 'values'

const FIELD_TYPES: CustomFieldSchema['type'][] = [
  'text',
  'textarea',
  'url',
  'color',
  'number',
  'boolean',
]

const inputBase: React.CSSProperties = {
  backgroundColor: '#282626',
  border: '1px solid rgba(255,255,255,0.1)',
}

export default function BlockBuilderPanel({ block, onChange }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('ai')
  const templateRef = useRef<HTMLTextAreaElement>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const schema = (block.props.__schema as CustomFieldSchema[]) ?? []
  const template = (block.props.__template as string) ?? ''

  const updateSchema = (newSchema: CustomFieldSchema[]) => {
    onChange({ ...block.props, __schema: newSchema })
  }

  const updateTemplate = (newTemplate: string) => {
    onChange({ ...block.props, __template: newTemplate })
  }

  const updateValue = (key: string, value: unknown) => {
    onChange({ ...block.props, [key]: value })
  }

  const addField = () => {
    const newField: CustomFieldSchema = {
      key: `field${schema.length + 1}`,
      label: `Field ${schema.length + 1}`,
      type: 'text',
    }
    updateSchema([...schema, newField])
  }

  const removeField = (index: number) => {
    updateSchema(schema.filter((_, i) => i !== index))
  }

  const updateField = (index: number, updates: Partial<CustomFieldSchema>) => {
    updateSchema(schema.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    setAiError(null)
    try {
      const res = await axiosInstance.post('/api/dynamic-pages/custom-block-ai', {
        prompt: aiPrompt.trim(),
      })
      const { schema: newSchema, template: newTemplate } = res.data as {
        schema: CustomFieldSchema[]
        template: string
      }
      onChange({ ...block.props, __schema: newSchema, __template: newTemplate })
      setActiveTab('fields')
    } catch {
      setAiError('Generation failed. Please try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const insertToken = (key: string) => {
    const ta = templateRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const token = `{{${key}}}`
    const next = template.slice(0, start) + token + template.slice(end)
    updateTemplate(next)
    requestAnimationFrame(() => {
      ta.focus()
      ta.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'ai', label: '✦ AI' },
    { id: 'fields', label: 'Fields' },
    { id: 'template', label: 'Template' },
    { id: 'values', label: 'Values' },
  ]

  return (
    <div
      className="w-80 flex-shrink-0 flex flex-col border-l overflow-hidden"
      style={{ backgroundColor: '#1f1d1d', borderColor: 'rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <p className="text-sm font-semibold text-white">Custom Block</p>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Define fields → write template → fill values
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 text-xs font-medium transition-colors"
            style={{
              color: activeTab === tab.id ? '#ffc418' : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === tab.id ? '2px solid #ffc418' : '2px solid transparent',
            }}
          >
            {tab.label}
            {tab.id === 'fields' && schema.length > 0 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ backgroundColor: 'rgba(255,196,24,0.15)', color: '#ffc418' }}
              >
                {schema.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* ─── AI TAB ─── */}
        {activeTab === 'ai' && (
          <div className="p-4 space-y-4">
            {/* Heading */}
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ backgroundColor: 'rgba(255,196,24,0.06)', border: '1px solid rgba(255,196,24,0.15)' }}
            >
              <p className="text-xs font-semibold" style={{ color: '#ffc418' }}>
                ✦ Generate with AI
              </p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Describe the component. AI generates fields + a Tailwind template that matches the site theme.
              </p>
              {/* Theme hint */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                {[
                  ['BG', '#282626'],
                  ['Card', '#323030'],
                  ['Accent', '#ffc418'],
                  ['Text', 'rgba(255,255,255,0.7)'],
                ].map(([name, val]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0 border"
                      style={{
                        backgroundColor: val,
                        borderColor: 'rgba(255,255,255,0.15)',
                      }}
                    />
                    <span className="text-[10px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {name}: {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                What should this block do?
              </label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generateWithAI()
                }}
                rows={5}
                placeholder={
                  'e.g. "A hero section with a headline, short description, a CTA button URL, and a yellow accent color picker"'
                }
                disabled={aiLoading}
                className="w-full px-3 py-2 rounded-md text-sm text-white outline-none resize-none"
                style={{ ...inputBase, opacity: aiLoading ? 0.5 : 1 }}
              />
              <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                ⌘ Enter to generate
              </p>
            </div>

            {/* Error */}
            {aiError && (
              <p className="text-xs px-3 py-2 rounded-md" style={{ backgroundColor: 'rgba(220,38,38,0.1)', color: 'rgba(220,38,38,0.8)' }}>
                {aiError}
              </p>
            )}

            {/* Generate button */}
            <button
              onClick={generateWithAI}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40"
              style={{ backgroundColor: '#ffc418', color: '#1f1d1d' }}
            >
              {aiLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Generating…
                </span>
              ) : (
                'Generate Component'
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>or build manually</span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Manual tab shortcuts */}
            <div className="grid grid-cols-3 gap-2">
              {(['fields', 'template', 'values'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="py-2 rounded-md text-xs font-medium capitalize transition-colors"
                  style={{
                    backgroundColor: '#282626',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── FIELDS TAB ─── */}
        {activeTab === 'fields' && (
          <div className="p-4 space-y-3">
            {schema.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                No fields yet. Add a field to get started.
              </p>
            )}

            {schema.map((field, i) => (
              <div
                key={i}
                className="p-3 rounded-lg space-y-2.5"
                style={{ backgroundColor: '#282626', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* Field token + remove */}
                <div className="flex items-center justify-between">
                  <span
                    className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{ backgroundColor: 'rgba(255,196,24,0.1)', color: '#ffc418' }}
                  >
                    {`{{${field.key || '…'}}}`}
                  </span>
                  <button
                    onClick={() => removeField(i)}
                    className="text-[11px] px-2 py-0.5 rounded transition-colors"
                    style={{ backgroundColor: 'rgba(220,38,38,0.12)', color: 'rgba(220,38,38,0.8)' }}
                  >
                    Remove
                  </button>
                </div>

                {/* Key + Label */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      className="block text-[10px] mb-1"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      Key
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        updateField(i, { key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })
                      }
                      className="w-full px-2 py-1.5 rounded text-xs text-white outline-none font-mono"
                      style={inputBase}
                      placeholder="myField"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-[10px] mb-1"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    >
                      Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      className="w-full px-2 py-1.5 rounded text-xs text-white outline-none"
                      style={inputBase}
                      placeholder="My Field"
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label
                    className="block text-[10px] mb-1"
                    style={{ color: 'rgba(255,255,255,0.4)' }}
                  >
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(i, { type: e.target.value as CustomFieldSchema['type'] })
                    }
                    className="w-full px-2 py-1.5 rounded text-xs text-white outline-none"
                    style={inputBase}
                  >
                    {FIELD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <button
              onClick={addField}
              className="w-full py-2.5 rounded-lg text-xs font-medium transition-all"
              style={{
                backgroundColor: 'rgba(255,196,24,0.07)',
                border: '1px dashed rgba(255,196,24,0.3)',
                color: '#ffc418',
              }}
            >
              + Add Field
            </button>

            {schema.length > 0 && (
              <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Switch to Template tab to use these fields
              </p>
            )}
          </div>
        )}

        {/* ─── TEMPLATE TAB ─── */}
        {activeTab === 'template' && (
          <div className="p-4 space-y-4">
            {/* Token chips */}
            {schema.length > 0 && (
              <div>
                <p className="text-[10px] mb-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Click a token to insert at cursor:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {schema.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => insertToken(f.key)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono transition-all hover:opacity-80"
                      style={{
                        backgroundColor: 'rgba(255,196,24,0.1)',
                        color: '#ffc418',
                        border: '1px solid rgba(255,196,24,0.2)',
                      }}
                      title={`Insert {{${f.key}}}`}
                    >
                      {`{{${f.key}}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {schema.length === 0 && (
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Tip: Add fields first, then use{' '}
                <span className="font-mono text-yellow-400/50">{'{{key}}'}</span> in your template.
              </p>
            )}

            {/* Template textarea */}
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                HTML Template
              </label>
              <textarea
                ref={templateRef}
                value={template}
                onChange={(e) => updateTemplate(e.target.value)}
                rows={18}
                placeholder={`<section class="py-20 bg-gray-900 text-center">
  <h1 class="text-4xl font-bold text-white">
    {{title}}
  </h1>
  <p class="mt-4 text-gray-400">
    {{subtitle}}
  </p>
</section>`}
                className="w-full px-3 py-2 rounded-md text-xs text-white outline-none resize-y font-mono"
                style={{ ...inputBase, lineHeight: '1.6', minHeight: 200 }}
                spellCheck={false}
              />
            </div>

            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Tailwind CSS classes work. Standard HTML attributes supported.
            </p>
          </div>
        )}

        {/* ─── VALUES TAB ─── */}
        {activeTab === 'values' && (
          <div className="p-4 space-y-4">
            {schema.length === 0 && (
              <p className="text-xs text-center py-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Define fields in the Fields tab first.
              </p>
            )}

            {schema.map((field) => (
              <div key={field.key}>
                <label
                  className="flex items-center gap-1.5 text-xs font-medium mb-1.5"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {field.label}
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: 'rgba(255,196,24,0.5)' }}
                  >
                    {`{{${field.key}}}`}
                  </span>
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-md text-sm text-white outline-none"
                    style={inputBase}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-md text-sm text-white outline-none resize-none"
                    style={inputBase}
                  />
                )}

                {field.type === 'url' && (
                  <input
                    type="url"
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className="w-full px-3 py-2 rounded-md text-sm text-white outline-none"
                    style={inputBase}
                  />
                )}

                {field.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(block.props[field.key] as string) ?? '#000000'}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="w-9 h-8 rounded cursor-pointer border-0 p-0.5"
                      style={{ backgroundColor: 'transparent' }}
                    />
                    <input
                      type="text"
                      value={(block.props[field.key] as string) ?? ''}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-md text-sm text-white outline-none font-mono"
                      style={inputBase}
                    />
                  </div>
                )}

                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(block.props[field.key] as boolean) ?? false}
                      onChange={(e) => updateValue(field.key, e.target.checked)}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: '#ffc418' }}
                    />
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      Enabled
                    </span>
                  </label>
                )}

                {field.type === 'number' && (
                  <input
                    type="number"
                    value={(block.props[field.key] as number) ?? 0}
                    onChange={(e) => updateValue(field.key, Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md text-sm text-white outline-none"
                    style={inputBase}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
