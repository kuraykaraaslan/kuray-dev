'use client'

import { useMemo, useState } from 'react'
import type { BlockDefinition } from '../types'

interface FAQItem {
  question: string
  answer: string
}

function parseFaqs(value: unknown): FAQItem[] {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value

    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is FAQItem => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof (item as FAQItem).question === 'string' &&
          typeof (item as FAQItem).answer === 'string'
        )
      })
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
  } catch {
    return []
  }
}

function FAQBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || 'oklch(var(--b2))'
  const cardBg = (rawProps.cardBgColor as string) || 'oklch(var(--b3))'
  const accent = (rawProps.accentColor as string) || 'oklch(var(--p))'

  const faqs = useMemo(() => parseFaqs(rawProps.faqs), [rawProps.faqs])

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      className="py-20 px-6 md:px-12 lg:px-20"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-3xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                {heading}
              </h2>
            )}

            {subtitle && (
              <p className="text-lg" style={{ color: 'oklch(var(--bc) / 0.7)' }}>
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i
            const contentId = `faq-content-${i}`

            return (
              <div
                key={`${faq.question}-${i}`}
                className="rounded-lg border-l-4 overflow-hidden"
                style={{
                  backgroundColor: cardBg,
                  borderColor: accent,
                }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={contentId}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()

                    setOpenIndex((current) => (current === i ? null : i))
                  }}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 hover:opacity-80 transition text-left"
                >
                  <h3 className="text-lg text-base-content font-medium">
                    {faq.question}
                  </h3>

                  <span
                    className={`shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    style={{ color: accent }}
                  >
                    ▼
                  </span>
                </button>

                <div
                  id={contentId}
                  className={`grid transition-all duration-200 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="px-6 pb-4 pt-4 border-t"
                      style={{
                        borderColor: accent,
                        color: 'oklch(var(--bc) / 0.7)',
                      }}
                    >
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export const FAQBlockDefinition: BlockDefinition = {
  type: 'FAQBlock',
  label: 'FAQ Accordion',
  category: 'Support',
  description: 'Frequently asked questions in accordion format.',
  defaultProps: {
    heading: 'Frequently Asked Questions',
    subtitle: 'Find answers to common questions',
    bgColor: '',
    cardBgColor: '',
    accentColor: '',
    faqs: JSON.stringify([
      {
        question: 'What is this product?',
        answer: 'This is a great product that solves your problems effectively.',
      },
      {
        question: 'How do I get started?',
        answer: 'You can sign up for an account and start using it immediately.',
      },
      {
        question: 'What is the pricing?',
        answer: 'We offer flexible pricing plans to fit your budget.',
      },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    faqs: { label: 'FAQs (JSON)', type: 'json' },
  },
  Component: FAQBlock,
}

export default FAQBlock