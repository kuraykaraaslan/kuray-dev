'use client'

import { useState } from 'react'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function DemoRequestBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const buttonLabel = (rawProps.buttonLabel as string) || 'Request Demo'

  const [submitted, setSubmitted] = useState(false)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-3xl mx-auto bg-base-200 rounded-lg p-8 md:p-12">
        <div className="text-center mb-8">
          {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
          {subtitle && <p className="text-lg text-base-content/70">{subtitle}</p>}
        </div>

        {submitted ? (
          <div className="text-center bg-primary text-primary-content rounded-md py-4">
            Thank you. Our team will reach out shortly.
          </div>
        ) : (
          <form
            className="grid md:grid-cols-2 gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <input className="input input-bordered w-full" placeholder="Full name" required />
            <input type="email" className="input input-bordered w-full" placeholder="Work email" required />
            <input className="input input-bordered w-full md:col-span-2" placeholder="Company" />
            <textarea className="textarea textarea-bordered w-full md:col-span-2" rows={4} placeholder="Tell us about your goals" />
            <button type="submit" className="btn btn-primary md:col-span-2">
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </BaseBlock>
  )
}

export const DemoRequestBlockDefinition: BlockDefinition = {
  type: 'DemoRequestBlock',
  label: 'Demo Request',
  category: 'Forms',
  description: 'Lead capture form for demo requests.',
  defaultProps: {
    heading: 'Book a Demo',
    subtitle: 'See how the platform fits your team',
    buttonLabel: 'Request Demo',
    blockClass: 'bg-base-100 py-20 px-6 md:px-12 lg:px-20',
    sectionId: 'demo-request',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    buttonLabel: { label: 'Button Label', type: 'text' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: DemoRequestBlock as unknown as BlockDefinition['Component'],
}

export default DemoRequestBlock
