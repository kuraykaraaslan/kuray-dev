'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

// Matches HowItWorks: numbered steps in a row with a connecting line

interface Step {
  number: string
  title: string
  description: string
}

const COLS_MAP: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
}

const DEFAULT_STEPS: Step[] = [
  { number: '1', title: 'Discover',  description: 'Understand your workflows & data' },
  { number: '2', title: 'Design',    description: 'Define the digital strategy' },
  { number: '3', title: 'Build',     description: 'Develop & integrate solutions' },
  { number: '4', title: 'Scale',     description: 'Optimize & evolve continuously' },
]

function parseSteps(raw: unknown): Step[] {
  if (Array.isArray(raw)) return raw as Step[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_STEPS
}

function StepsBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || 'How It Works'
  const steps = parseSteps(rawProps.steps)

  const colsClass = COLS_MAP[steps.length] ?? 'md:grid-cols-4'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-base-content text-center mb-16">{heading}</h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-base-content/10" />

          <div className={`grid ${colsClass} gap-8 relative`}>
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 relative z-10 bg-primary text-primary-content">
                  {step.number}
                </div>
                <h3 className="text-2xl text-base-content mb-2">{step.title}</h3>
                <p className="text-base-content/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const StepsBlockDefinition: BlockDefinition = {
  type: 'StepsBlock',
  label: 'Steps / How It Works',
  category: 'Process',
  description: 'Numbered steps in a row with a connecting line — used in "How It Works"',
  defaultProps: {
    heading: 'How It Works',
    steps: DEFAULT_STEPS,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'how-it-works',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Section Heading', type: 'text' },
    steps: {
      label: 'Steps',
      type: 'repeater',
      fields: {
        number:      { label: 'Number',      type: 'text',     value: '1' },
        title:       { label: 'Title',       type: 'text',     value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: StepsBlock as unknown as BlockDefinition['Component'],
}

export default StepsBlock
