'use client'

import { useMemo, useState } from 'react'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
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
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined

  const faqs = useMemo(() => parseFaqs(rawProps.faqs), [rawProps.faqs])

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqSchema = faqs.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null

  return (
    <BaseBlock {...baseProps}>
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="relative z-10 max-w-3xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && (
              <h2 className="text-4xl md:text-5xl text-base-content mb-4">
                {heading}
              </h2>
            )}

            {subtitle && (
              <p className="text-lg text-base-content/70">
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
                className="bg-base-200 rounded-lg border-l-4 border-primary overflow-hidden"
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
                    className={`shrink-0 transition-transform duration-200 text-primary ${isOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                  <span className="sr-only">{isOpen ? 'Collapse' : 'Expand'}</span>
                </button>

                <div
                  id={contentId}
                  className={`grid transition-all duration-200 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-4 pt-4 border-t border-primary text-base-content/70">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </BaseBlock>
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
    faqs: [
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
    ],
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'faq',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    faqs: {
      label: 'FAQ Items',
      type: 'repeater',
      fields: {
        question: { label: 'Question', type: 'text',     value: '' },
        answer:   { label: 'Answer',   type: 'textarea', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: FAQBlock as unknown as BlockDefinition['Component'],
}

export default FAQBlock
