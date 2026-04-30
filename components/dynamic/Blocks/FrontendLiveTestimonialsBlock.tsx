'use client'

import { useEffect, useState } from 'react'
import axiosInstance from '@/libs/axios'
import type { BlockDefinition } from '../types'

interface Testimonial {
  testimonialId: string
  name: string
  title?: string
  company?: string
  content: string
  avatarUrl?: string
  rating?: number
}

function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div className="p-6 rounded-2xl bg-base-100 border border-base-content/10 flex flex-col gap-4">
      <p className="text-base-content/70 leading-relaxed text-sm">"{t.content}"</p>
      <div className="flex items-center gap-3 mt-auto">
        {t.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={t.avatarUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
            {t.name.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-semibold text-base-content text-sm">{t.name}</p>
          {(t.title || t.company) && (
            <p className="text-xs text-base-content/40">
              {[t.title, t.company].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
        {t.rating && (
          <div className="ml-auto text-yellow-400 text-sm">
            {'★'.repeat(Math.min(t.rating, 5))}
          </div>
        )}
      </div>
    </div>
  )
}

function FrontendLiveTestimonialsBlock(rawProps: Record<string, unknown>) {
  const heading = (rawProps.heading as string) || 'What Clients Say'
  const description = (rawProps.description as string) || 'Real feedback from clients worldwide.'
  const bgColor = (rawProps.bgColor as string) || 'oklch(var(--b3))'

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  useEffect(() => {
    axiosInstance
      .get('/api/testimonials?pageSize=100')
      .then((res) => {
        const all: Testimonial[] = res.data.testimonials ?? []
        setTestimonials(all.filter((t: any) => t.status === 'PUBLISHED'))
      })
      .catch(() => { /* silently fail */ })
  }, [])

  if (!testimonials.length) return null

  const half = Math.ceil(testimonials.length / 2)
  const left = testimonials.slice(0, half)
  const right = testimonials.slice(half)

  return (
    <section className="py-20 px-6 md:px-12" style={{ backgroundColor: bgColor }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid xl:grid-cols-5 gap-12 items-center">
          <div className="xl:col-span-2 text-center xl:text-left">
            <h2 className="text-4xl font-bold text-base-content mb-4">{heading}</h2>
            <p className="text-base-content/60 text-lg leading-relaxed">{description}</p>
          </div>
          <div className="xl:col-span-3 grid md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              {left.map((t) => <TestimonialCard key={t.testimonialId} t={t} />)}
            </div>
            <div className="flex flex-col gap-4">
              {right.map((t) => <TestimonialCard key={t.testimonialId} t={t} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const FrontendLiveTestimonialsBlockDefinition: BlockDefinition = {
  type: 'FrontendLiveTestimonialsBlock',
  label: 'Live Testimonials',
  description: 'Fetches published testimonials from the site API and renders them in a two-column layout.',
  category: 'Frontend',
  defaultProps: {
    heading: 'What Clients Say',
    description: 'Real feedback from clients worldwide.',
    bgColor: '',
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    bgColor: { label: 'Background Color', type: 'color' },
  },
  Component: FrontendLiveTestimonialsBlock,
}

export default FrontendLiveTestimonialsBlock
