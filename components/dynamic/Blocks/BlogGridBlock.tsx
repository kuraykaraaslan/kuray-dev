'use client'

import Link from 'next/link'
import type { BlockDefinition } from '../types'

interface BlogPost {
  title: string
  excerpt?: string
  category?: string
  date?: string
  href: string
}

function BlogGridBlock(rawProps: Record<string, unknown>) {
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const bg = (rawProps.bgColor as string) || '#282626'
  const cardBg = (rawProps.cardBgColor as string) || '#323030'
  const accent = (rawProps.accentColor as string) || '#ffc418'

  let posts: BlogPost[] = []
  try {
    const raw = rawProps.posts
    posts = typeof raw === 'string' ? JSON.parse(raw) : (raw as BlogPost[]) ?? []
  } catch {
    posts = []
  }

  return (
    <section className="py-20 px-6 md:px-12 lg:px-20" style={{ backgroundColor: bg }}>
      <div className="max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-white mb-4">{heading}</h2>}
            {subtitle && <p className="text-lg" style={{ color: 'rgba(255,255,255,0.7)' }}>{subtitle}</p>}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link key={i} href={post.href} className="rounded-lg p-6 hover:-translate-y-1 transition" style={{ backgroundColor: cardBg }}>
              {post.category && (
                <div className="text-xs font-semibold uppercase mb-3" style={{ color: accent }}>
                  {post.category}
                </div>
              )}
              <h3 className="text-2xl text-white font-bold mb-3">{post.title}</h3>
              {post.date && <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{post.date}</p>}
              {post.excerpt && <p style={{ color: 'rgba(255,255,255,0.7)' }}>{post.excerpt}</p>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export const BlogGridBlockDefinition: BlockDefinition = {
  type: 'BlogGridBlock',
  label: 'Blog Grid',
  category: 'Content',
  description: 'Showcase recent blog posts or articles.',
  defaultProps: {
    heading: 'Latest Insights',
    subtitle: 'Read our latest thought leadership content',
    bgColor: '#282626',
    cardBgColor: '#323030',
    accentColor: '#ffc418',
    posts: JSON.stringify([
      { title: 'How to Scale Enterprise Workflows', category: 'Operations', date: 'Apr 2026', href: '/blog/scale-workflows', excerpt: 'Key patterns for scaling cross-functional operations.' },
      { title: 'Security Checklist for Modern Platforms', category: 'Security', date: 'Mar 2026', href: '/blog/security-checklist', excerpt: 'Practical controls for enterprise-grade applications.' },
      { title: 'Designing Better Admin Dashboards', category: 'Product', date: 'Feb 2026', href: '/blog/admin-dashboards', excerpt: 'UI decisions that improve team efficiency.' },
    ]),
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    bgColor: { label: 'Background Color', type: 'color' },
    cardBgColor: { label: 'Card Background Color', type: 'color' },
    accentColor: { label: 'Accent Color', type: 'color' },
    posts: { label: 'Posts (JSON)', type: 'json' },
  },
  Component: BlogGridBlock,
}

export default BlogGridBlock