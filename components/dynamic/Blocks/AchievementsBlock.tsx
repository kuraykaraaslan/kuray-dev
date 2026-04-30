'use client'

import { useEffect, useState } from 'react'
import type { BlockDefinition } from '../types'

interface Achievement {
  label: string
  value: string
  suffix?: string
}

function AchievementsBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const accent = (rawProps.accentColor as string) || '#ffc418'
  const [counts, setCounts] = useState<Record<number, number>>({})

  let achievements: Achievement[] = []
  try {
    const raw = rawProps.achievements
    achievements = typeof raw === 'string' ? JSON.parse(raw) : (raw as Achievement[]) ?? []
  } catch {
    achievements = []
  }

  useEffect(() => {
    const targets: Record<number, number> = {}
    achievements.forEach((a, i) => {
      targets[i] = parseInt(a.value) || 0
    })

    const duration = 2000
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const newCounts: Record<number, number> = {}
      achievements.forEach((_, i) => {
        newCounts[i] = Math.floor(targets[i] * progress)
      })
      setCounts(newCounts)

      if (progress < 1) requestAnimationFrame(animate)
    }

    animate()
  }, [achievements])

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
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

        <div className="grid md:grid-cols-4 gap-8">
          {achievements.map((achievement, i) => (
            <div key={i} className="text-center">
              <div className="text-5xl font-bold mb-2" style={{ color: accent }}>
                {counts[i] !== undefined ? counts[i] : 0}
                {achievement.suffix}
              </div>
              <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>
                {achievement.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export const AchievementsBlockDefinition: BlockDefinition = {
  type: 'AchievementsBlock',
  label: 'Achievements',
  category: 'Social Proof',
  description: 'Display animated achievement statistics.',
  defaultProps: {
    heading: 'Our Impact',
    subtitle: 'Trusted by thousands of companies worldwide',
    bgColor: '#282626',
    accentColor: '#ffc418',
    achievements: JSON.stringify([
      { label: 'Happy Clients', value: '5000', suffix: '+' },
      { label: 'Projects Completed', value: '10000', suffix: '+' },
      { label: 'Team Members', value: '500', suffix: '+' },
      { label: 'Years in Business', value: '15', suffix: '' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    achievements: { label: 'Achievements (JSON)', type: 'json' },
  },
  Component: AchievementsBlock,
}

export default AchievementsBlock
