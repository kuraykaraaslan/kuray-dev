'use client'

import Link from 'next/link'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface CaseStudy {
  title: string
  company: string
  challenge: string
  solution: string
  result: string
  image?: string
  href?: string
}

function CaseStudyBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  let caseStudies: CaseStudy[] = []
  try {
    const raw = rawProps.caseStudies
    caseStudies = typeof raw === 'string' ? JSON.parse(raw) : (raw as CaseStudy[]) ?? []
  } catch {
    caseStudies = []
  }

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-6xl mx-auto">
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
          {caseStudies.map((study, i) => {
            const content = (
              <div className="bg-base-200 rounded-lg p-8 h-full flex flex-col justify-between hover:shadow-xl transition">
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2 text-primary">
                      {study.company}
                    </p>
                    <h3 className="text-2xl text-base-content font-bold">{study.title}</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold mb-1 text-primary">
                        Challenge
                      </p>
                      <p className="text-base-content/70">{study.challenge}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-primary">
                        Solution
                      </p>
                      <p className="text-base-content/70">{study.solution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1 text-primary">
                        Result
                      </p>
                      <p className="text-base-content/70">{study.result}</p>
                    </div>
                  </div>
                </div>

                {study.href && (
                  <Link href={study.href} className="text-sm font-semibold text-primary">
                    Read Full Story →
                  </Link>
                )}
              </div>
            )

            return <div key={i}>{content}</div>
          })}
        </div>
      </div>
    </BaseBlock>
  )
}

const defaultCaseStudies: CaseStudy[] = [
  {
    title: 'Increased Efficiency by 40%',
    company: 'Tech Company A',
    challenge: 'Managing complex workflows manually',
    solution: 'Implemented automation solution',
    result: '40% efficiency gain, $500k saved annually',
    href: '/case-studies/1',
  },
  {
    title: 'Reduced Costs by 30%',
    company: 'Enterprise B',
    challenge: 'High infrastructure costs',
    solution: 'Migrated to cloud platform',
    result: '30% cost reduction in first year',
    href: '/case-studies/2',
  },
]

export const CaseStudyBlockDefinition: BlockDefinition = {
  type: 'CaseStudyBlock',
  label: 'Case Studies',
  category: 'Social Proof',
  description: 'Showcase success stories and case studies.',
  defaultProps: {
    heading: 'Success Stories',
    subtitle: 'See how we helped companies like yours',
    caseStudies: defaultCaseStudies,
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'case-studies',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    caseStudies: {
      label: 'Case Studies',
      type: 'repeater',
      fields: {
        title:     { label: 'Title',     type: 'text',     value: '' },
        company:   { label: 'Company',   type: 'text',     value: '' },
        challenge: { label: 'Challenge', type: 'textarea', value: '' },
        solution:  { label: 'Solution',  type: 'textarea', value: '' },
        result:    { label: 'Result',    type: 'textarea', value: '' },
        href:      { label: 'Link URL',  type: 'url',      value: '' },
        image:     { label: 'Image',     type: 'img',      value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: CaseStudyBlock as unknown as BlockDefinition['Component'],
}

export default CaseStudyBlock
