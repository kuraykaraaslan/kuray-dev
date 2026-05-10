'use client'

import Contact from '@/components/frontend/Features/Hero/Contact'
import type { BlockDefinition } from '../types'

function HeroContactLiveBlock(rawProps: Record<string, unknown>) {
  const bgColor = rawProps.bgColor as string | undefined
  return <Contact bsckgroundColor={bgColor} />
}

export const HeroContactLiveBlockDefinition: BlockDefinition = {
  type: 'HeroContactLiveBlock',
  label: 'Hero Contact (Live)',
  description: 'Portfolio contact section with form, phone/email reveal, and social links.',
  category: 'Frontend',
  defaultProps: {
    bgColor: '',
  },
  schema: {
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: HeroContactLiveBlock,
}

export default HeroContactLiveBlock
