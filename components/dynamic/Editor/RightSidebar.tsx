'use client'

import { useState } from 'react'
import PropsPanel from './PropsPanel'
import BlockBuilderPanel from './BlockBuilderPanel'
import { useEditorStore, selectSelectedBlock } from './stores/editorStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

export default function RightSidebar() {
  const block = useEditorStore(selectSelectedBlock)
  const updateBlockProps = useEditorStore((s) => s.updateBlockProps)
  const [collapsed, setCollapsed] = useState(false)

  const onChange = (props: Record<string, unknown>) => {
    if (block) updateBlockProps(block.id, props)
  }

  if (collapsed) {
    return (
      <div className="w-10 flex-shrink-0 flex flex-col border-l border-base-content/10 bg-base-200 items-center py-3 gap-3">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand properties panel"
          className="w-7 h-7 flex items-center justify-center rounded-md text-base-content/40 hover:text-base-content hover:bg-base-300 transition-colors"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
        </button>
        <div className="flex-1 flex items-center">
          <span className="text-[9px] font-semibold tracking-widest text-base-content/25 uppercase" style={{ writingMode: 'vertical-rl' }}>Properties</span>
        </div>
      </div>
    )
  }

  const collapseButton = (
    <button
      onClick={() => setCollapsed(true)}
      title="Collapse properties panel"
      className="w-6 h-6 flex items-center justify-center rounded text-base-content/30 hover:text-base-content hover:bg-base-300 transition-colors flex-shrink-0"
    >
      <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
    </button>
  )

  if (block?.type === 'custom') {
    return <BlockBuilderPanel block={block} onChange={onChange} collapseButton={collapseButton} />
  }
  return <PropsPanel block={block} onChange={onChange} collapseButton={collapseButton} />
}
