import type { BlockDefinition } from './types'
import { ExampleBlockDefinition } from './Blocks/ExampleBlock'
import { CustomBlockDefinition } from './Blocks/CustomBlock'

const REGISTRY: Record<string, BlockDefinition> = {
  [ExampleBlockDefinition.type]: ExampleBlockDefinition,
  [CustomBlockDefinition.type]: CustomBlockDefinition,
}

export function getBlock(type: string): BlockDefinition | undefined {
  return REGISTRY[type]
}

export function getAllBlockDefinitions(): BlockDefinition[] {
  return Object.values(REGISTRY)
}

export default REGISTRY
