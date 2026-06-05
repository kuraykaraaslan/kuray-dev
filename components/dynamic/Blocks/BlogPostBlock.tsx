'use client'

import DOMPurify from 'isomorphic-dompurify'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar, faClock, faEye, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import BaseBlock, { BASE_BLOCK_DEFAULT_PROPS, BASE_BLOCK_SCHEMA_FIELDS, parseBaseBlockProps } from '../partials/BaseBlock'
import type { BlockDefinition } from '../types'

function BlogPostBlock(rawProps: Record<string, unknown>) {
  const baseProps = parseBaseBlockProps(rawProps)
  const title = (rawProps.title as string) || 'Blog Post Title'
  const description = rawProps.description as string | undefined
  const content = (rawProps.content as string) || ''
  const image = rawProps.image as string | undefined
  const categoryTitle = (rawProps.categoryTitle as string) || 'Category'
  const categorySlug = (rawProps.categorySlug as string) || 'category'
  const showCategory = rawProps.showCategory !== false
  const showViews = rawProps.showViews !== false
  const showReadTime = rawProps.showReadTime !== false
  const createdAt = (rawProps.createdAt as string) || new Date().toISOString()
  const views = (rawProps.views as number) || 0

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
  const readTime = `${Math.max(1, Math.ceil(words / 200))} min read`

  return (
    <BaseBlock {...baseProps}>
      <div className="min-h-screen pt-24">
        {image && (
          <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-base-100 to-transparent" />
          </div>
        )}

        <div className="px-6 md:px-12 lg:px-20 py-12">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-base-content/60 hover:text-base-content transition-colors mb-8 text-sm"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
              Back to Blog
            </Link>

            {showCategory && (
              <div className="mb-4">
                <Link
                  href={`/blog/${categorySlug}`}
                  className="inline-block px-3 py-1 rounded text-xs font-medium bg-primary text-primary-content"
                >
                  {categoryTitle}
                </Link>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl text-base-content mb-6 leading-tight">{title}</h1>

            <div className="flex items-center gap-6 text-base-content/50 text-sm mb-8 flex-wrap border-b border-base-content/10 pb-8">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="w-4 h-4" />
                {formattedDate}
              </div>
              {showReadTime && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                  {readTime}
                </div>
              )}
              {showViews && (
                <div className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                  {views} views
                </div>
              )}
            </div>

            {description && (
              <p className="text-xl text-base-content/70 mb-8 leading-relaxed border-l-4 border-primary pl-6">
                {description}
              </p>
            )}

            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
            />
          </div>
        </div>
      </div>
    </BaseBlock>
  )
}

export const BlogPostBlockDefinition: BlockDefinition = {
  type: 'BlogPostBlock',
  label: 'Blog Post',
  category: 'Content',
  description: 'Full blog post view with hero image, metadata, and HTML content.',
  defaultProps: {
    title: 'Blog Post Title',
    description: 'A compelling summary of the article.',
    content: '<p>Write your article content here...</p>',
    image: '',
    categoryTitle: 'Category',
    categorySlug: 'category',
    showCategory: true,
    showViews: true,
    showReadTime: true,
    createdAt: new Date().toISOString(),
    views: 0,
    blockClass: 'bg-base-100 min-h-screen',
    sectionId: 'blog-post',
    ...BASE_BLOCK_DEFAULT_PROPS,
  },
  schema: {
    title: { label: 'Title', type: 'text' },
    description: { label: 'Description', type: 'textarea' },
    content: { label: 'Content', type: 'rich-text' },
    image: { label: 'Hero Image', type: 'img' },
    categoryTitle: { label: 'Category Title', type: 'text' },
    categorySlug: { label: 'Category Slug', type: 'text' },
    showCategory: { label: 'Show Category', type: 'boolean' },
    showViews: { label: 'Show Views', type: 'boolean' },
    showReadTime: { label: 'Show Read Time', type: 'boolean' },
    createdAt: { label: 'Created At', type: 'text' },
    views: { label: 'Views', type: 'number' },
    ...BASE_BLOCK_SCHEMA_FIELDS,
  },
  Component: BlogPostBlock as unknown as BlockDefinition['Component'],
}

export default BlogPostBlock
