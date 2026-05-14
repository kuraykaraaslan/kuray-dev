'use client'

interface Props {
  template: string
  props: Record<string, unknown>
}

export default function TemplateBlockRenderer({ template, props }: Props) {
  if (!template) {
    return (
      <div className="py-20 px-6 flex items-center justify-center min-h-40 bg-base-200 border-2 border-dashed border-base-content/20">
        <p className="text-base-content/30 text-sm">Block has no template.</p>
      </div>
    )
  }

  const html = template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = props[key]
    return val !== undefined && val !== null ? String(val) : ''
  })

  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
