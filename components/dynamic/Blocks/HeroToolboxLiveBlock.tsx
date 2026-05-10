'use client'

import Toolbox from '@/components/frontend/Features/Hero/Toolbox'
import type { BlockDefinition } from '../types'

function HeroToolboxLiveBlock(_rawProps: Record<string, unknown>) {
  return <Toolbox />
}

export const HeroToolboxLiveBlockDefinition: BlockDefinition = {
  type: 'HeroToolboxLiveBlock',
  label: 'Hero Toolbox (Live)',
  description: 'Portfolio tech stack section with tool cards and skill badges. Content driven by i18n.',
  category: 'Frontend',
  defaultProps: {},
  schema: {},
  Component: HeroToolboxLiveBlock,
}

export default HeroToolboxLiveBlock
