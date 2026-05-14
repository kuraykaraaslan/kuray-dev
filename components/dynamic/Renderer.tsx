import { Suspense } from 'react'
import type { BlockData, DynamicPageBlockRecord } from './types'
import { getCodeBlock } from './BlockRegistry'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import TemplateBlockRenderer from './TemplateBlockRenderer'

interface Props {
  sections: BlockData[]
}

function ServerBlock({ block, dbDefs }: { block: BlockData; dbDefs: DynamicPageBlockRecord[] }) {
  try {
    const codeDef = getCodeBlock(block.type)
    if (codeDef) {
      const { Component } = codeDef
      return <Component {...block.props} />
    }
    const dbDef = dbDefs.find((d) => d.type === block.type)
    if (!dbDef) return null
    return <TemplateBlockRenderer template={dbDef.template} props={block.props} />
  } catch (e) {
    console.error(`[DynamicPageRenderer] Failed to render block type="${block.type}" id="${block.id}"`, e)
    return null
  }
}

export default async function DynamicPageRenderer({ sections }: Props) {
  const dbDefs = await DynamicPageBlockService.getAll()
  const sorted = [...sections]
    .sort((a, b) => a.order - b.order)
    .filter((block) => block.hidden !== true)

  return (
    <div className="bg-base-100">
      {sorted.map((block) => (
        <Suspense key={block.id} fallback={null}>
          <ServerBlock block={block} dbDefs={dbDefs} />
        </Suspense>
      ))}
    </div>
  )
}
