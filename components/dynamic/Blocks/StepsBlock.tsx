'use client'

import type { BlockDefinition } from '../types'

// Matches HowItWorks: numbered steps in a row with a connecting line

interface Step {
  number: string
  title: string
  description: string
}

function StepsBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'How It Works'
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let steps: Step[] = []
  try {
    const raw = rawProps.steps
    steps = typeof raw === 'string' ? JSON.parse(raw) : (raw as Step[]) ?? []
  } catch {
    steps = []
  }

  const cols =
    steps.length === 3
      ? 'md:grid-cols-3'
      : steps.length === 5
        ? 'md:grid-cols-5'
        : 'md:grid-cols-4'

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl text-white text-center mb-16">{heading}</h2>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-white/10" />

          <div className={`grid ${cols} gap-8 relative`}>
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mb-4 relative z-10"
                  style={{ backgroundColor: accent, color: bg }}
                >
                  {step.number}
                </div>
                <h3 className="text-2xl text-white mb-2">{step.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)' }}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const defaultSteps: Step[] = [
  { number: '1', title: 'Discover', description: 'Understand your workflows & data' },
  { number: '2', title: 'Design', description: 'Define the digital strategy' },
  { number: '3', title: 'Build', description: 'Develop & integrate solutions' },
  { number: '4', title: 'Scale', description: 'Optimize & evolve continuously' },
]

export const StepsBlockDefinition: BlockDefinition = {
  type: 'StepsBlock',
  label: 'Steps / How It Works',
  category: 'Process',
  description: 'Numbered steps in a row with a connecting line — used in "How It Works"',
  defaultProps: {
    heading: 'How It Works',
    steps: JSON.stringify(defaultSteps, null, 2),
    bgColor: '#282626',
    accentColor: '#ffc418',
  },
  schema: {
    heading: { label: 'Section Heading', type: 'text' },
    steps: {
      label: 'Steps (JSON array)',
      type: 'json',
      placeholder: '[{"number":"1","title":"Step","description":"Description"}]',
    },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: StepsBlock,
}

export default StepsBlock
