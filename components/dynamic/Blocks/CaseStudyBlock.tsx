'use client'

import Link from 'next/link'
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
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let caseStudies: CaseStudy[] = []
  try {
    const raw = rawProps.caseStudies
    caseStudies = typeof raw === 'string' ? JSON.parse(raw) : (raw as CaseStudy[]) ?? []
  } catch {
    caseStudies = []
  }

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

        <div className="grid md:grid-cols-2 gap-8">
          {caseStudies.map((study, i) => {
            const content = (
              <div
                className="rounded-lg p-8 h-full flex flex-col justify-between hover:shadow-xl transition"
                style={{ backgroundColor: cardBg }}
              >
                <div>
                  <div className="mb-4">
                    <p className="text-sm font-semibold mb-2" style={{ color: accent }}>
                      {study.company}
                    </p>
                    <h3 className="text-2xl text-white font-bold">{study.title}</h3>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
                        Challenge
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>{study.challenge}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
                        Solution
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>{study.solution}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-1" style={{ color: accent }}>
                        Result
                      </p>
                      <p style={{ color: 'rgba(255,255,255,0.7)' }}>{study.result}</p>
                    </div>
                  </div>
                </div>

                {study.href && (
                  <Link href={study.href} className="text-sm font-semibold" style={{ color: accent }}>
                    Read Full Story →
                  </Link>
                )}
              </div>
            )

            return <div key={i}>{content}</div>
          })}
        </div>
      </div>
    </section>
  )
}

export const CaseStudyBlockDefinition: BlockDefinition = {
  type: 'CaseStudyBlock',
  label: 'Case Studies',
  category: 'Social Proof',
  description: 'Showcase success stories and case studies.',
  defaultProps: {
    heading: 'Success Stories',
    subtitle: 'See how we helped companies like yours',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    caseStudies: JSON.stringify([
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
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    caseStudies: { label: 'Case Studies (JSON)', type: 'json' },
  },
  Component: CaseStudyBlock,
}

export default CaseStudyBlock
