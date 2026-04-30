'use client'

import type { BlockData } from '../types'
import PropsPanel from './PropsPanel'
import BlockBuilderPanel from './BlockBuilderPanel'

interface Props {
  block: BlockData | null
  onChange: (props: Record<string, unknown>) => void
}

export default function RightSidebar({ block, onChange }: Props) {
  if (block?.type === 'custom') {
    return <BlockBuilderPanel block={block} onChange={onChange} />
  }
  return <PropsPanel block={block} onChange={onChange} />
}
