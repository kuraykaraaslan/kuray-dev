import type { BlockDefinition, DynamicPageBlockRecord } from './types'
import { CustomBlockDefinition } from './Blocks/CustomBlock'
import { ProseBlockDefinition } from './Blocks/ProseBlock'
import { WelcomeBlockDefinition } from './Blocks/WelcomeBlock'
import { PlatformsBlockDefinition } from './Blocks/PlatformsBlock'
import { GitContributionsBlockDefinition } from './Blocks/GitContributionsBlock'
import { ServicesBlockDefinition } from './Blocks/ServicesBlock'
import { TimelineBlockDefinition } from './Blocks/TimelineBlock'
import { HireMeBlockDefinition } from './Blocks/HireMeBlock'
import { ToolboxBlockDefinition } from './Blocks/ToolboxBlock'
import { TestimonialsBlockDefinition } from './Blocks/TestimonialsBlock'
import { ProjectsBlockDefinition } from './Blocks/ProjectsBlock'
import { ContactBlockDefinition } from './Blocks/ContactBlock'

// Code-level blocks (special / built-in)
const CODE_BLOCKS: Record<string, BlockDefinition> = {
  [CustomBlockDefinition.type]: CustomBlockDefinition,
  [ProseBlockDefinition.type]: ProseBlockDefinition,
  [WelcomeBlockDefinition.type]: WelcomeBlockDefinition,
  [PlatformsBlockDefinition.type]: PlatformsBlockDefinition,
  [GitContributionsBlockDefinition.type]: GitContributionsBlockDefinition,
  [ServicesBlockDefinition.type]: ServicesBlockDefinition,
  [TimelineBlockDefinition.type]: TimelineBlockDefinition,
  [HireMeBlockDefinition.type]: HireMeBlockDefinition,
  [ToolboxBlockDefinition.type]: ToolboxBlockDefinition,
  [TestimonialsBlockDefinition.type]: TestimonialsBlockDefinition,
  [ProjectsBlockDefinition.type]: ProjectsBlockDefinition,
  [ContactBlockDefinition.type]: ContactBlockDefinition,
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
