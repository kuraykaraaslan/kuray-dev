import type { BlockDefinition, DynamicPageBlockRecord } from './types'
import { CustomBlockDefinition } from './Blocks/CustomBlock'
import { ProseBlockDefinition } from './Blocks/ProseBlock'
import { WelcomeBlockDefinition } from './Blocks/WelcomeBlock'

// Code-level blocks (special / built-in)
const CODE_BLOCKS: Record<string, BlockDefinition> = {
  [CustomBlockDefinition.type]: CustomBlockDefinition,
  [ProseBlockDefinition.type]: ProseBlockDefinition,
  [WelcomeBlockDefinition.type]: WelcomeBlockDefinition,
}

export function getCodeBlock(type: string): BlockDefinition | undefined {
  return CODE_BLOCKS[type]
}

export function getCodeBlocks(): BlockDefinition[] {
  return Object.values(CODE_BLOCKS)
}

// Resolve a block definition from either code registry or DB records
// Returns null if not found in either
export function resolveBlockDef(
  type: string,
  dbDefs: DynamicPageBlockRecord[]
): DynamicPageBlockRecord | BlockDefinition | null {
  if (CODE_BLOCKS[type]) return CODE_BLOCKS[type]
  return dbDefs.find((d) => d.type === type) ?? null
}
