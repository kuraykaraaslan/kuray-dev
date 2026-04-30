'use client'

import type { BlockDefinition } from '../types'

interface ProcessStep {
  number: string
  title: string
  description: string
}

function ProcessFlowBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const layout = (rawProps.layout as string) || 'horizontal'

  let steps: ProcessStep[] = []
  try {
    const raw = rawProps.steps
    steps = typeof raw === 'string' ? JSON.parse(raw) : (raw as ProcessStep[]) ?? []
  } catch {
    steps = []
  }

  const isVertical = layout === 'vertical'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        {isVertical ? (
          <div className="space-y-8 max-w-2xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: accent }}
                  >
                    {step.number}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-1 h-16 my-4" style={{ backgroundColor: accent }}></div>
                  )}
                </div>
                <div className="pt-4 pb-8">
                  <h3 className="text-2xl text-white mb-2 font-bold">{step.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div
                  className="rounded-lg p-8"
                  style={{ backgroundColor: cardBg }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mb-4"
                    style={{ backgroundColor: accent }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl text-white mb-2 font-bold">{step.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <span style={{ color: accent }}>→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    steps: JSON.stringify([
      { number: '1', title: 'Sign Up', description: 'Create your account in seconds' },
      { number: '2', title: 'Configure', description: 'Set up your preferences' },
      { number: '3', title: 'Deploy', description: 'Launch your solution' },
      { number: '4', title: 'Succeed', description: 'Achieve your goals' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    layout: { label: 'Layout', type: 'select', options: ['horizontal', 'vertical'] },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    steps: { label: 'Steps (JSON)', type: 'json' },
  },
  Component: ProcessFlowBlock,
}

export default ProcessFlowBlock
