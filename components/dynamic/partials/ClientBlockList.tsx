'use client'

import { Suspense } from 'react'
import type { BlockData, DynamicPageBlockRecord } from '../types'
import { getCodeBlock } from '../utils/BlockRegistry'
import { BlockRenderErrorBoundary } from './BlockErrorBoundary'
import TemplateBlockRenderer from './TemplateBlockRenderer'

interface Props {
  sections: BlockData[]
  dbDefs: DynamicPageBlockRecord[]
}

function BlockSkeleton({ type }: { type: string }) {
  const codeDef = getCodeBlock(type)
  const height = codeDef?.skeletonHeight ?? 300
  return <div className="w-full animate-pulse bg-base-200" style={{ height }} />
}

function ClientBlock({ block, dbDefs }: { block: BlockData; dbDefs: DynamicPageBlockRecord[] }) {
  const codeDef = getCodeBlock(block.type)
  if (codeDef) {
    const { Component } = codeDef
    return (
      <BlockRenderErrorBoundary blockType={block.type}>
        <Component {...block.props} __blockId={block.id} />
      </BlockRenderErrorBoundary>
    )
  }
  const dbDef = dbDefs.find((d) => d.type === block.type)
  if (!dbDef) return null
  return (
    <BlockRenderErrorBoundary blockType={block.type}>
      <TemplateBlockRenderer template={dbDef.template} props={block.props} script={dbDef.script} blockType={block.type} />
    </BlockRenderErrorBoundary>
  )
}

export default function ClientBlockList({ sections, dbDefs }: Props) {
  const sorted = [...sections]
    .sort((a, b) => a.order - b.order)
    .filter((block) => block.hidden !== true)

  return (
    <div className="bg-base-100">
      {sorted.map((block) => (
        <div key={block.id} className={block.className} data-block-type={block.type}>
          <Suspense fallback={<BlockSkeleton type={block.type} />}>
            <ClientBlock block={block} dbDefs={dbDefs} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}
