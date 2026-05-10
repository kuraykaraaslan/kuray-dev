'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axiosInstance from '@/libs/axios'
import { toast } from 'react-toastify'
import FormHeader from '@/components/common/Forms/FormHeader'
import DynamicText from '@/components/common/Forms/DynamicText'
import DynamicSelect from '@/components/common/Forms/DynamicSelect'
import GenericElement from '@/components/common/Forms/GenericElement'
import Form from '@/components/common/Forms/Form'

const CATEGORIES = ['General', 'Hero', 'Content', 'CTA', 'Custom']

const SingleBlock = () => {
  const params = useParams<{ blockId: string }>()
  const blockId = params?.blockId
  const router = useRouter()

  const mode: 'create' | 'edit' = useMemo(
    () => (blockId === 'create' ? 'create' : 'edit'),
    [blockId]
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isSystem, setIsSystem] = useState(false)

  const [type, setType] = useState('')
  const [label, setLabel] = useState('')
  const [category, setCategory] = useState('General')
  const [description, setDescription] = useState('')
  const [template, setTemplate] = useState('')
  const [schema, setSchema] = useState('{}')
  const [defaultProps, setDefaultProps] = useState('{}')

  useEffect(() => {
    if (!blockId || blockId === 'create') { setLoading(false); return }

    let cancelled = false
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/api/dynamic-pages/block-definitions/${blockId}`)
        const block = res.data?.block
        if (!block || cancelled) return
        setType(block.type ?? '')
        setLabel(block.label ?? '')
        setCategory(block.category ?? 'General')
        setDescription(block.description ?? '')
        setTemplate(block.template ?? '')
        setSchema(JSON.stringify(block.schema ?? {}, null, 2))
        setDefaultProps(JSON.stringify(block.defaultProps ?? {}, null, 2))
        setIsSystem(block.isSystem ?? false)
      } catch (err: unknown) {
        toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load block')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [blockId])

  const handleSubmit = async () => {
    if (!type.trim()) { toast.error('Type is required'); return }
    if (!label.trim()) { toast.error('Label is required'); return }

    let parsedSchema: unknown
    let parsedDefaultProps: unknown
    try { parsedSchema = JSON.parse(schema) } catch { toast.error('Schema is not valid JSON'); return }
    try { parsedDefaultProps = JSON.parse(defaultProps) } catch { toast.error('Default Props is not valid JSON'); return }

    const body = { type, label, category, description, template, schema: parsedSchema, defaultProps: parsedDefaultProps }

    setSaving(true)
    try {
      if (mode === 'create') {
        await axiosInstance.post('/api/dynamic-pages/block-definitions', body)
        toast.success('Block created')
      } else {
        await axiosInstance.patch(`/api/dynamic-pages/block-definitions/${blockId}`, body)
        toast.success('Block updated')
      }
      router.push('/admin/blocks')
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const monoClass = 'w-full px-3 py-2 rounded-md text-sm font-mono text-base-content outline-none bg-base-100 border border-base-content/10 resize-none focus:border-primary/50 transition-colors'

  return (
    <Form
      className="mx-auto mb-8 bg-base-300 p-6 rounded-lg shadow max-w-7xl"
      actions={[
        {
          label: saving ? 'Saving…' : 'Save',
          onClick: handleSubmit,
          className: 'btn-primary',
          disabled: saving || loading || isSystem,
          loading: saving,
        },
        {
          label: 'Cancel',
          onClick: () => router.push('/admin/blocks'),
          className: 'btn-secondary',
        },
      ]}
    >
      <FormHeader
        title={mode === 'create' ? 'Create Block' : 'Edit Block'}
        className="my-4"
        actionButtons={[
          {
            text: 'Back to Blocks',
            className: 'btn-sm btn-primary',
            onClick: () => router.push('/admin/blocks'),
          },
        ]}
      />

      {isSystem && (
        <div className="alert alert-warning mb-4">
          <span className="text-sm">This is a system block. Its metadata is read-only.</span>
        </div>
      )}

      <DynamicText
        label="Type (unique identifier)"
        placeholder="e.g. HeroBannerBlock"
        value={type}
        setValue={mode === 'edit' ? () => {} : setType}
        size="md"
      />

      <DynamicText
        label="Label"
        placeholder="Hero Banner"
        value={label}
        setValue={isSystem ? () => {} : setLabel}
        size="md"
      />

      <DynamicSelect
        label="Category"
        selectedValue={category}
        onValueChange={isSystem ? () => {} : setCategory}
        options={CATEGORIES.map((c) => ({ value: c, label: c }))}
      />

      <DynamicText
        label="Description"
        placeholder="Short description shown in the editor sidebar"
        value={description}
        setValue={isSystem ? () => {} : setDescription}
        size="md"
        isTextarea
      />

      <GenericElement label="Template (HTML with {{field}} placeholders)">
        <textarea
          className={monoClass}
          rows={12}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder={'<section>\n  <h1>{{title}}</h1>\n  <p>{{description}}</p>\n</section>'}
          disabled={isSystem}
        />
      </GenericElement>

      <GenericElement label="Schema (JSON)">
        <textarea
          className={monoClass}
          rows={10}
          value={schema}
          onChange={(e) => setSchema(e.target.value)}
          placeholder={'{\n  "title": { "label": "Title", "type": "text" }\n}'}
          disabled={isSystem}
        />
      </GenericElement>

      <GenericElement label="Default Props (JSON)">
        <textarea
          className={monoClass}
          rows={6}
          value={defaultProps}
          onChange={(e) => setDefaultProps(e.target.value)}
          placeholder={'{\n  "title": "Hello World"\n}'}
          disabled={isSystem}
        />
      </GenericElement>
    </Form>
  )
}

export default SingleBlock
