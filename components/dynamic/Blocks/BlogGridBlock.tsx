'use client'

import Link from 'next/link'
import BaseBlock, {
  BASE_BLOCK_DEFAULT_PROPS,
  BASE_BLOCK_SCHEMA_FIELDS,
  parseBaseBlockProps,
} from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

interface BlogPost {
  title: string
  excerpt?: string
  category?: string
  date?: string
  href: string
}

function parsePosts(raw: unknown): BlogPost[] {
  if (Array.isArray(raw)) return raw as BlogPost[]
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) } catch {}
  }
  return []
}

function BlogGridBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const heading = rawProps.heading as string | undefined
  const subtitle = rawProps.subtitle as string | undefined
  const posts = parsePosts(rawProps.posts)

  return (
    <BaseBlock {...baseProps}>
      <div className="relative z-10 max-w-7xl mx-auto">
        {(heading || subtitle) && (
          <div className="text-center mb-16">
            {heading && <h2 className="text-4xl md:text-5xl text-base-content mb-4">{heading}</h2>}
            {subtitle && (
              <p className="text-lg text-base-content/70">{subtitle}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <Link
              key={i}
              href={post.href}
              className="bg-base-300 rounded-lg p-6 hover:-translate-y-1 transition block"
            >
              {post.category && (
                <div className="text-xs font-semibold uppercase mb-3 text-primary">
                  {post.category}
                </div>
              )}
              <h3 className="text-2xl text-base-content font-bold mb-3">{post.title}</h3>
              {post.date && (
                <p className="text-sm mb-3 text-base-content/50">{post.date}</p>
              )}
              {post.excerpt && (
                <p className="text-base-content/70">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </BaseBlock>
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
    posts: [
      {
        title: 'How to Scale Enterprise Workflows',
        category: 'Operations',
        date: 'Apr 2026',
        href: '/blog/scale-workflows',
        excerpt: 'Key patterns for scaling cross-functional operations.',
      },
      {
        title: 'Security Checklist for Modern Platforms',
        category: 'Security',
        date: 'Mar 2026',
        href: '/blog/security-checklist',
        excerpt: 'Practical controls for enterprise-grade applications.',
      },
      {
        title: 'Designing Better Admin Dashboards',
        category: 'Product',
        date: 'Feb 2026',
        href: '/blog/admin-dashboards',
        excerpt: 'UI decisions that improve team efficiency.',
      },
    ],
    blockClass: 'py-20 px-6 md:px-12 lg:px-20 bg-base-200',
    sectionId: 'blog',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    heading: { label: 'Heading', type: 'text' },
    subtitle: { label: 'Subtitle', type: 'text' },
    posts: {
      label: 'Posts',
      type: 'repeater',
      fields: {
        title:    { label: 'Title',    type: 'text',     value: '' },
        category: { label: 'Category', type: 'text',     value: '' },
        date:     { label: 'Date',     type: 'text',     value: '' },
        excerpt:  { label: 'Excerpt',  type: 'textarea', value: '' },
        href:     { label: 'URL',      type: 'url',      value: '/' },
      },
    },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: BlogGridBlock as unknown as BlockDefinition['Component'],
}

export default BlogGridBlock
