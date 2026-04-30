'use client'

import type { BlockDefinition } from '../types'

// Matches Clients section:
//   - Badge + heading
//   - Testimonial cards (quote, name, company, initials avatar)
//   - Partners row

interface Testimonial {
  quote: string
  name: string
  company: string
}

function TestimonialsBlock(rawProps: Record<string, unknown>) {
  const badge = rawProps.badge as string | undefined
  const heading = (rawProps.heading as string) || 'Trusted by Industry Leaders'
  const partnersLabel = rawProps.partnersLabel as string | undefined
  const partnersNote = rawProps.partnersNote as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#1f1d1d'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let testimonials: Testimonial[] = []
  try {
    const raw = rawProps.testimonials
    testimonials = typeof raw === 'string' ? JSON.parse(raw) : (raw as Testimonial[]) ?? []
  } catch {
    testimonials = []
  }

  let partners: string[] = []
  try {
    const raw = rawProps.partners
    partners = typeof raw === 'string' ? JSON.parse(raw) : (raw as string[]) ?? []
  } catch {
    partners = []
  }

  return (
    <section className="px-6 md:px-12 lg:px-20 py-24" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          {badge && (
            <p
              className="text-sm font-semibold tracking-widest uppercase mb-3"
              style={{ color: accent }}
            >
              {badge}
            </p>
          )}
          <h2 className="text-4xl md:text-5xl text-white">{heading}</h2>
        </div>

        {/* Testimonials */}
        <div className="flex flex-col items-center gap-10">
          {testimonials.map((t, i) => {
            const initials = (t.name ?? '')
              .split(' ')
              .filter(Boolean)
              .map((n) => n[0])
              .join('')

            return (
              <div
                key={i}
                className="w-full max-w-4xl rounded-2xl p-10 relative"
                style={{ backgroundColor: cardBg }}
              >
                {/* Quote mark */}
                <div
                  className="text-5xl leading-none mb-6 opacity-40 font-serif"
                  style={{ color: accent }}
                >
                  &ldquo;
                </div>

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <svg
                      key={si}
                      className="w-4 h-4"
                      fill={accent}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-lg leading-relaxed mb-8 italic"
                  style={{ color: 'rgba(255,255,255,0.8)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Attribution */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: accent, color: cardBg }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{t.name}</p>
                    <p className="text-sm" style={{ color: accent }}>
                      {t.company}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Partners row */}
        {partners.length > 0 && (
          <div className="mt-20 text-center">
            {partnersLabel && (
              <p
                className="text-sm uppercase tracking-widest mb-8"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {partnersLabel}
              </p>
            )}
            <div className="flex flex-wrap justify-center items-center gap-6">
              {partners.map((name) => (
                <div
                  key={name}
                  className="px-6 py-3 rounded-lg text-sm font-medium border border-white/10 hover:border-white/20 hover:text-white/70 transition-all"
                  style={{ backgroundColor: cardBg, color: 'rgba(255,255,255,0.5)' }}
                >
                  {name}
                </div>
              ))}
            </div>
            {partnersNote && (
              <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {partnersNote}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

const defaultTestimonials: Testimonial[] = [
  {
    quote:
      "Kuray Karaaslan is at the top of my list when seeking an external, but TRUE INDUSTRY PARTNER with a broad vision and diverse strategic project experience.",
    name: 'Hilda Espinal',
    company: 'CannonDesign',
  },
]

const defaultPartners = ['CannonDesign', 'AECOM', 'Parsons', 'AESG', 'Arcadis', 'Dar Al Omran']

export const TestimonialsBlockDefinition: BlockDefinition = {
  type: 'TestimonialsBlock',
  label: 'Testimonials + Partners',
  category: 'Trust & Social Proof',
  description: 'Testimonial cards with stars, quote, attribution — plus a partners logo row',
  defaultProps: {
    badge: 'Our Clients',
    heading: 'Trusted by Industry Leaders',
    testimonials: JSON.stringify(defaultTestimonials, null, 2),
    partnersLabel: 'Our Partners',
    partners: JSON.stringify(defaultPartners),
    partnersNote: '…and many more industry-leading organizations across 7 countries.',
    bgColor: '#282626',
    cardBgColor: '#1f1d1d',
    accentColor: '#ffc418',
  },
  schema: {
    badge: { label: 'Badge (above heading)', type: 'text', placeholder: 'Our Clients' },
    heading: { label: 'Heading', type: 'text' },
    testimonials: {
      label: 'Testimonials (JSON array)',
      type: 'json',
      placeholder: '[{"quote":"...","name":"Name","company":"Company"}]',
    },
    partnersLabel: { label: 'Partners Section Label', type: 'text' },
    partners: { label: 'Partners (JSON string array)', type: 'json' },
    partnersNote: { label: 'Partners Footer Note', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
  },
  Component: TestimonialsBlock,
}

export default TestimonialsBlock
