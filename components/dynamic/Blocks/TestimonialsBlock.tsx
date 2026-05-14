'use client'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import { useState, useEffect } from 'react'
import { usePreviewMode } from '../partials/PreviewContext'
import Image from 'next/image'
import axiosInstance from '@/libs/axios'
import type { BlockDefinition } from '../types'

interface TestimonialItem {
  name: string
  title: string
  review: string
  image: string
}

function TestimonialCard({ name, title, review, image }: TestimonialItem) {
  return (
    <div className="p-6 rounded shadow-md bg-base-100">
      <p>{review}</p>
      <div className="flex items-center mt-4 space-x-4">
        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={48}
              height={48}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-2xl font-bold rounded-full bg-primary text-primary-content">
              {name?.[0] ?? '?'}
            </div>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-base-content/60">{title}</p>
        </div>
      </div>
    </div>
  )
}

function TestimonialsBlock(rawProps: Record<string, unknown>) {
  const previewMode = usePreviewMode()
  const baseProps = parseBaseBlockProps(rawProps)
  const title = (rawProps.title as string) || 'What People Say'
  const description = (rawProps.description as string) || 'Feedback from clients and collaborators.'
  const dataSource = (rawProps.dataSource as string) || 'manual'
  const manualItems = (rawProps.testimonials as TestimonialItem[]) || []

  const [dbItems, setDbItems] = useState<TestimonialItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (dataSource !== 'api') return
    setLoading(true)
    axiosInstance
      .get('/api/testimonials?pageSize=100')
      .then((res) => {
        const all = res.data.testimonials ?? []
        setDbItems(
          all
            .filter((t: { status: string }) => t.status === 'PUBLISHED')
            .map((t: { name: string; title: string; review: string; image?: string }) => ({
              name: t.name,
              title: t.title,
              review: t.review,
              image: t.image ?? '',
            }))
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [dataSource])

  const testimonials = dataSource === 'api' ? dbItems : manualItems

  const half = Math.ceil(testimonials.length / 2)
  const leftColumn = testimonials.slice(0, half)
  const rightColumn = testimonials.slice(half)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 container px-6 py-4 mx-auto pb-0 md:pb-20">
        <div className={`grid items-center gap-4 ${previewMode !== 'mobile' ? 'xl:grid-cols-5' : ''}`}>
          <div className="max-w-2xl mx-auto my-8 space-y-4 text-center xl:col-span-2 xl:text-left">
            <h2 className="text-4xl font-bold">{title}</h2>
            <p>{description}</p>
          </div>
          <div className="p-6 xl:col-span-3 pt-0">
            {loading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md text-base-content/40" />
              </div>
            ) : testimonials.length === 0 ? (
              <p className="text-center text-base-content/30 text-sm py-8">
                {dataSource === 'api' ? 'No published testimonials found in the database.' : 'No testimonials added yet.'}
              </p>
            ) : (
              <div className={`grid gap-4 ${previewMode !== 'mobile' ? 'md:grid-cols-2' : ''}`}>
                <div className="grid content-center gap-4">
                  {leftColumn.map((t, i) => <TestimonialCard key={i} {...t} />)}
                </div>
                <div className="grid content-center gap-4">
                  {rightColumn.map((t, i) => <TestimonialCard key={i} {...t} />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const TestimonialsBlockDefinition: BlockDefinition = {
  type: 'TestimonialsBlock',
  label: 'Testimonials',
  description: 'Two-column testimonial grid — manual entries or loaded from the database.',
  category: 'Hero',
  defaultProps: {
    title: 'What People Say',
    description: 'Feedback from clients and collaborators.',
    blockClass: 'bg-base-300 md:px-24',
    dataSource: 'manual',
    ...BASE_BLOCK_DEFAULT_PROPS,
    testimonials: [
      {
        name: 'Jane Doe',
        title: 'CEO, Acme Inc.',
        review: 'Absolutely outstanding work. Delivered on time and exceeded expectations.',
        image: '',
      },
      {
        name: 'John Smith',
        title: 'CTO, Startup Co.',
        review: 'Great communication, clean code, and a pleasure to work with.',
        image: '',
      },
    ],
  },
  schema: {
    title: { label: 'Section Title', type: 'text' },
    description: { label: 'Section Description', type: 'textarea' },
    dataSource: { label: 'Data Source', type: 'select', options: ['manual', 'api'] },
    testimonials: {
      label: 'Testimonials (manual mode only)',
      type: 'repeater',
      fields: {
        name: { label: 'Name', type: 'text', value: '' },
        title: { label: 'Role / Company', type: 'text', value: '' },
        review: { label: 'Review', type: 'textarea', value: '' },
        image: { label: 'Avatar', type: 'img', uploadFolder: 'testimonials', value: '' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: TestimonialsBlock as unknown as BlockDefinition['Component'],
}

export default TestimonialsBlock
