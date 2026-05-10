'use client'

import ProjectsHero from '@/components/frontend/Features/Hero/Projects'
import type { BlockDefinition } from '../types'

function HeroProjectsLiveBlock(_rawProps: Record<string, unknown>) {
  return <ProjectsHero />
}

export const HeroProjectsLiveBlockDefinition: BlockDefinition = {
  type: 'HeroProjectsLiveBlock',
  label: 'Hero Projects (Live)',
  description: 'Portfolio projects grid with filter tabs and expand/collapse. Fetches live projects from API.',
  category: 'Frontend',
  defaultProps: {},
  schema: {},
  Component: HeroProjectsLiveBlock,
}

export default HeroProjectsLiveBlock
