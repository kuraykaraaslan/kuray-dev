'use client'

import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface ProcessStep {
  number: string
  title: string
  description?: string
}

const DEFAULT_STEPS: ProcessStep[] = [
  { number: '1', title: 'Sign Up', description: 'Create your account in seconds' },
  { number: '2', title: 'Configure', description: 'Set up your preferences' },
  { number: '3', title: 'Deploy', description: 'Launch your solution' },
  { number: '4', title: 'Succeed', description: 'Achieve your goals' },
]

function parseSteps(raw: unknown): ProcessStep[] {
  if (Array.isArray(raw)) return raw as ProcessStep[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return DEFAULT_STEPS
}

function ProcessFlowBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = (rawProps.heading as string) || ''
  const subtitle = (rawProps.subtitle as string) || ''
  const layout = (rawProps.layout as string) || 'horizontal'
  const steps = parseSteps(rawProps.steps)
  const isVertical = layout === 'vertical'

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-20">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
          </div>
        )}

        {isVertical ? (
          <div className="space-y-8 max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold bg-primary text-primary-content flex-shrink-0">
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-1 h-16 my-4 bg-primary" />
                  )}
                </div>
                <div className="pt-4 pb-8">
                  <h3 className="text-2xl text-base-content mb-2 font-bold">{step.title}</h3>
                  {step.description && <p className="text-base-content/70">{step.description}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-base-200 rounded-lg p-8">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-primary text-primary-content mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl text-base-content mb-2 font-bold">{step.title}</h3>
                  {step.description && <p className="text-base-content/70 text-sm">{step.description}</p>}
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2">
                    <span className="text-primary">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BaseBlock>
  )
}

export const ProcessFlowBlockDefinition: BlockDefinition = {
  type: 'ProcessFlowBlock',
  label: 'Process Flow',
  category: 'Content',
  description: 'Display process steps with flow arrows.',
  defaultProps: {
    heading: 'How It Works',
    subtitle: 'Our simple 4-step process',
    layout: 'horizontal',
    steps: DEFAULT_STEPS,
    blockClass: 'bg-base-200 py-4',
    sectionId: 'process',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    layout: { label: 'Layout', type: 'select', options: ['horizontal', 'vertical'], value: 'horizontal' },
    steps: {
      label: 'Steps',
      type: 'repeater',
      fields: {
        number: { label: 'Step Number', type: 'text', value: '' },
        title: { label: 'Title', type: 'text', value: '' },
        description: { label: 'Description', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: ProcessFlowBlock as unknown as BlockDefinition['Component'],
}

export default ProcessFlowBlock
