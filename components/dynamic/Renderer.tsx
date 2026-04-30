'use client'

import type { BlockData } from './types'
import { getBlock } from './BlockRegistry'

interface Props {
  sections: BlockData[]
}

export default function DynamicPageRenderer({ sections }: Props) {
  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="bg-base-100">
      {sorted.map((block) => {
        const def = getBlock(block.type)
        if (!def) return null
        const { Component } = def
        return <Component key={block.id} {...block.props} />
      })}
    </div>
  )
}
