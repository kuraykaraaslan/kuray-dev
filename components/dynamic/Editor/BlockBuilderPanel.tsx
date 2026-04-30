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

  const inputCls = 'w-full px-3 py-2 rounded-md text-sm text-base-content outline-none bg-base-300 border border-base-content/10'

  return (
    <div className="w-80 flex-shrink-0 flex flex-col border-l border-base-content/10 overflow-hidden bg-base-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-base-content/10">
        <p className="text-sm font-semibold text-base-content">Custom Block</p>
        <p className="text-xs mt-0.5 text-base-content/35">
          Define fields → write template → fill values
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-base-content/10 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-primary border-primary'
                : 'text-base-content/40 border-transparent'
            }`}
          >
            {tab.label}
            {tab.id === 'fields' && schema.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary">
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
            <div className="rounded-lg p-3 space-y-2 bg-primary/5 border border-primary/15">
              <p className="text-xs font-semibold text-primary">
                ✦ Generate with AI
              </p>
              <p className="text-[11px] text-base-content/40">
                Describe the component. AI generates fields + a Tailwind template that matches the site theme.
              </p>
              {/* Theme hint */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                {[
                  ['BG', 'bg-base-200'],
                  ['Card', 'bg-base-300'],
                  ['Accent', 'bg-primary'],
                  ['Text', 'text-base-content/70'],
                ].map(([name, val]) => (
                  <div key={name} className="flex items-center gap-1.5">
                    <span className={`w-3 h-3 rounded-sm flex-shrink-0 border border-base-content/15 ${val}`} />
                    <span className="text-[10px] font-mono truncate text-base-content/35">
                      {name}: {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-base-content/55">
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
                className={`${inputCls} resize-none ${aiLoading ? 'opacity-50' : ''}`}
              />
              <p className="text-[10px] mt-1 text-base-content/20">
                ⌘ Enter to generate
              </p>
            </div>

            {/* Error */}
            {aiError && (
              <p className="text-xs px-3 py-2 rounded-md bg-error/10 text-error/80">
                {aiError}
              </p>
            )}

            {/* Generate button */}
            <button
              onClick={generateWithAI}
              disabled={aiLoading || !aiPrompt.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-40 bg-primary text-primary-content"
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
              <div className="flex-1 h-px bg-base-content/10" />
              <span className="text-[10px] text-base-content/25">or build manually</span>
              <div className="flex-1 h-px bg-base-content/10" />
            </div>

            {/* Manual tab shortcuts */}
            <div className="grid grid-cols-3 gap-2">
              {(['fields', 'template', 'values'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="py-2 rounded-md text-xs font-medium capitalize transition-colors bg-base-300 border border-base-content/10 text-base-content/50"
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
              <p className="text-xs text-center py-6 text-base-content/30">
                No fields yet. Add a field to get started.
              </p>
            )}

            {schema.map((field, i) => (
              <div
                key={i}
                className="p-3 rounded-lg space-y-2.5 bg-base-300 border border-base-content/10"
              >
                {/* Field token + remove */}
                <div className="flex items-center justify-between">
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-primary/10 text-primary">
                    {`{{${field.key || '…'}}}`}
                  </span>
                  <button
                    onClick={() => removeField(i)}
                    className="text-[11px] px-2 py-0.5 rounded transition-colors bg-error/12 text-error/80"
                  >
                    Remove
                  </button>
                </div>

                {/* Key + Label */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] mb-1 text-base-content/40">
                      Key
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        updateField(i, { key: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })
                      }
                      className="w-full px-2 py-1.5 rounded text-xs text-base-content outline-none font-mono bg-base-200 border border-base-content/10"
                      placeholder="myField"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] mb-1 text-base-content/40">
                      Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(i, { label: e.target.value })}
                      className="w-full px-2 py-1.5 rounded text-xs text-base-content outline-none bg-base-200 border border-base-content/10"
                      placeholder="My Field"
                    />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-[10px] mb-1 text-base-content/40">
                    Type
                  </label>
                  <select
                    value={field.type}
                    onChange={(e) =>
                      updateField(i, { type: e.target.value as CustomFieldSchema['type'] })
                    }
                    className="w-full px-2 py-1.5 rounded text-xs text-base-content outline-none bg-base-200 border border-base-content/10"
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
              className="w-full py-2.5 rounded-lg text-xs font-medium transition-all bg-primary/5 border border-dashed border-primary/30 text-primary"
            >
              + Add Field
            </button>

            {schema.length > 0 && (
              <p className="text-[10px] text-center text-base-content/25">
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
                <p className="text-[10px] mb-2 text-base-content/35">
                  Click a token to insert at cursor:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {schema.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => insertToken(f.key)}
                      className="px-2 py-0.5 rounded text-[11px] font-mono transition-all hover:opacity-80 bg-primary/10 text-primary border border-primary/20"
                      title={`Insert {{${f.key}}}`}
                    >
                      {`{{${f.key}}}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {schema.length === 0 && (
              <p className="text-[11px] text-base-content/30">
                Tip: Add fields first, then use{' '}
                <span className="font-mono text-primary/50">{'{{key}}'}</span> in your template.
              </p>
            )}

            {/* Template textarea */}
            <div>
              <label className="block text-xs font-medium mb-1.5 text-base-content/55">
                HTML Template
              </label>
              <textarea
                ref={templateRef}
                value={template}
                onChange={(e) => updateTemplate(e.target.value)}
                rows={18}
                placeholder={`<section class="py-20 bg-base-200 text-center">
  <h1 class="text-4xl font-bold text-base-content">
    {{title}}
  </h1>
  <p class="mt-4 text-base-content/60">
    {{subtitle}}
  </p>
</section>`}
                className={`${inputCls} resize-y font-mono text-xs`}
                style={{ lineHeight: '1.6', minHeight: 200 }}
                spellCheck={false}
              />
            </div>

            <p className="text-[11px] text-base-content/25">
              Tailwind CSS classes work. Standard HTML attributes supported.
            </p>
          </div>
        )}

        {/* ─── VALUES TAB ─── */}
        {activeTab === 'values' && (
          <div className="p-4 space-y-4">
            {schema.length === 0 && (
              <p className="text-xs text-center py-6 text-base-content/30">
                Define fields in the Fields tab first.
              </p>
            )}

            {schema.map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-1.5 text-xs font-medium mb-1.5 text-base-content/55">
                  {field.label}
                  <span className="font-mono text-[10px] text-primary/50">
                    {`{{${field.key}}}`}
                  </span>
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className={inputCls}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                )}

                {field.type === 'url' && (
                  <input
                    type="url"
                    value={(block.props[field.key] as string) ?? ''}
                    onChange={(e) => updateValue(field.key, e.target.value)}
                    className={inputCls}
                  />
                )}

                {field.type === 'color' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={(block.props[field.key] as string) ?? '#000000'}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className="w-9 h-8 rounded cursor-pointer border-0 p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={(block.props[field.key] as string) ?? ''}
                      onChange={(e) => updateValue(field.key, e.target.value)}
                      className={`flex-1 ${inputCls}`}
                    />
                  </div>
                )}

                {field.type === 'boolean' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(block.props[field.key] as boolean) ?? false}
                      onChange={(e) => updateValue(field.key, e.target.checked)}
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
                    value={(block.props[field.key] as number) ?? 0}
                    onChange={(e) => updateValue(field.key, Number(e.target.value))}
                    className={inputCls}
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
