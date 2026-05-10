'use client'

import Welcome from '@/components/frontend/Features/Hero/Welcome'
import type { BlockDefinition } from '../types'

function HeroWelcomeLiveBlock(_rawProps: Record<string, unknown>) {
  return <Welcome />
}

export const HeroWelcomeLiveBlockDefinition: BlockDefinition = {
  type: 'HeroWelcomeLiveBlock',
  label: 'Hero Welcome (Live)',
  description: 'Portfolio welcome section with typing effect, image, and CTAs. Content driven by i18n.',
  category: 'Frontend',
  defaultProps: {},
  schema: {},
  Component: HeroWelcomeLiveBlock,
}

export default HeroWelcomeLiveBlock
