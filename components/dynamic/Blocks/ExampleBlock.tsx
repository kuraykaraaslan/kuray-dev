import Link from 'next/link'
import type { BlockDefinition } from '../types'

function ExampleBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'Example Block'
  const description = (rawProps.description as string) || 'This is an example block.'
  const ctaLabel = rawProps.ctaLabel as string | undefined
  const ctaHref = (rawProps.ctaHref as string) || '#'
  const bgColor = (rawProps.bgColor as string) || ''

  return (
    <section className="py-20 px-6" style={{ backgroundColor: bgColor }}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-base-content mb-4">{heading}</h2>
        <p className="text-base-content/60 text-lg mb-8">{description}</p>
        {ctaLabel && (
          <Link href={ctaHref} className="btn btn-primary">
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}

export const ExampleBlockDefinition: BlockDefinition = {
  type: 'ExampleBlock',
  label: 'Example Block',
  description: 'A simple example block with heading, description, and optional CTA.',
  category: 'General',
  defaultProps: {
    heading: 'Example Block',
    description: 'This is an example block.',
    ctaLabel: 'Learn More',
    ctaHref: '#',
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    ctaLabel: { label: 'Button Label', type: 'text' },
    ctaHref: { label: 'Button URL', type: 'url' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: ExampleBlock,
}

export default ExampleBlock
