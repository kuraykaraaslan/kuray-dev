'use client'

import PropsPanel from './PropsPanel'
import BlockBuilderPanel from './BlockBuilderPanel'
import { useEditorStore, selectSelectedBlock } from './stores/editorStore'

export default function RightSidebar() {
  const block = useEditorStore(selectSelectedBlock)
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)

  const onChange = (props: Record<string, unknown>) => {
    if (block) updateBlockProps(block.id, props)
  }

  if (block?.type === 'custom') {
    return <BlockBuilderPanel block={block} onChange={onChange} />
  }
  return <PropsPanel block={block} onChange={onChange} />
}
