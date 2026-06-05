'use client'

import { useEffect } from 'react'
import DOMPurify from 'isomorphic-dompurify'

interface Props {
  template: string
  props: Record<string, unknown>
  script?: string
  blockType?: string  // omit in editor/preview contexts to skip script injection
}

const replaceTokens = (str: string, props: Record<string, unknown>) =>
  str.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = props[key]
    return val !== undefined && val !== null ? String(val) : ''
  })

export default function TemplateBlockRenderer({ template, props, script, blockType }: Props) {
  useEffect(() => {
    if (!script || !blockType) return
    const id = `block-script-${blockType}`
    if (document.getElementById(id)) return
    const el = document.createElement('script')
    el.id = id
    el.textContent = replaceTokens(script, props)
    document.body.appendChild(el)
  }, [blockType, script]) // props intentionally omitted — script tokens fixed at first render

  if (!template) {
    return (
      <div className="py-20 px-6 flex items-center justify-center min-h-40 bg-base-200 border-2 border-dashed border-base-content/20">
        <p className="text-base-content/30 text-sm">Block has no template.</p>
      </div>
    )
  }

  const html = replaceTokens(template, props)
  return <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
}
