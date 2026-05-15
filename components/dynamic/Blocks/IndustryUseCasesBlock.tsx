'use client'

import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface RawUseCase {
  industry: string
  icon?: string
  useCases?: string | string[]
}

interface UseCase {
  industry: string
  icon?: string
  useCases: string[]
}

function parseUseCases(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[]
  if (typeof raw === 'string') {
    if (raw.trimStart().startsWith('[')) {
      try { return JSON.parse(raw) } catch {}
    }
    return raw.split('\n').filter(Boolean)
  }
  return []
}

function IndustryUseCasesBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let industries: UseCase[] = []
  try {
    const raw = rawProps.industries
    const arr: RawUseCase[] = typeof raw === 'string' ? JSON.parse(raw) : (raw as RawUseCase[]) ?? []
    industries = arr.map(item => ({ ...item, useCases: parseUseCases(item.useCases) }))
  } catch {
    industries = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="py-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {(heading || subtitle) && (
            <div className="text-center mb-16">
              {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
              {subtitle && (
                <p className="text-lg text-base-content/70">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {industries.map((industry, i) => (
              <div
                key={i}
                className="bg-base-200 rounded-lg p-8 border-l-4 border-primary"
              >
                <div className="flex items-center gap-4 mb-4">
                  {industry.icon && <span className="text-4xl">{industry.icon}</span>}
                  <h3 className="text-2xl text-base-content font-bold">{industry.industry}</h3>
                </div>

                <ul className="space-y-2">
                  {industry.useCases.map((useCase, ui) => (
                    <li key={ui} className="flex items-start gap-3">
                      <span className="text-primary">✓</span>
                      <span className="text-base-content/70">{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const IndustryUseCasesBlockDefinition: BlockDefinition = {
  type: 'IndustryUseCasesBlock',
  label: 'Industry Use Cases',
  category: 'Content',
  description: 'Show use cases by industry in accent-bordered cards.',
  defaultProps: {
    heading: 'Industry Solutions',
    subtitle: 'Tailored for your business',
    industries: [
      {
        industry: 'Healthcare',
        icon: '🏥',
        useCases: 'Patient record management\nAppointment scheduling\nTelemedicine integration',
      },
      {
        industry: 'Finance',
        icon: '💰',
        useCases: 'Risk analysis\nPortfolio management\nCompliance reporting',
      },
      {
        industry: 'Retail',
        icon: '🛍️',
        useCases: 'Inventory tracking\nPOS systems\nCustomer analytics',
      },
      {
        industry: 'Technology',
        icon: '💻',
        useCases: 'DevOps automation\nCode deployment\nPerformance monitoring',
      },
    ],
    blockClass: 'bg-base-100 pt-16',
    sectionId: '',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    industries: {
      label: 'Industries',
      type: 'repeater',
      fields: {
        industry: { label: 'Industry Name', type: 'text', value: '' },
        icon: { label: 'Icon (emoji)', type: 'text', value: '' },
        useCases: { label: 'Use Cases (one per line)', type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: IndustryUseCasesBlock as unknown as BlockDefinition['Component'],
}

export default IndustryUseCasesBlock
