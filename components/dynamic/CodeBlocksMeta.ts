// Server-safe metadata for code-level blocks (no React components, no 'use client').
// Used by API routes that need to list all blocks without importing client components.

import type { FieldSchema } from './types'

export interface CodeBlockMeta {
  type: string
  label: string
  category: string
  description: string
  schema: Record<string, FieldSchema>
  defaultProps: Record<string, unknown>
}

export const CODE_BLOCK_META: CodeBlockMeta[] = [
  {
    type: 'custom',
    label: 'Custom Block',
    category: 'Custom',
    description: 'A fully custom block with your own HTML template and field schema.',
    schema: {},
    defaultProps: {},
  },
  {
    type: 'ProseBlock',
    label: 'Prose Document',
    category: 'Content',
    description: 'Full-page document with title and HTML content — ideal for Privacy Policy, Terms of Use, etc.',
    schema: {
      title: { label: 'Title', type: 'text', placeholder: 'Privacy Policy' },
      subtitle: { label: 'Subtitle / Last Updated', type: 'text', placeholder: 'Last Updated: January 1, 2025' },
      content: { label: 'Content (HTML)', type: 'textarea', placeholder: '<h2>Heading</h2><p>Paragraph...</p>' },
    },
    defaultProps: {
      title: 'Document Title',
      subtitle: 'Last Updated: January 1, 2025',
      content: '<h2>Section</h2><p>Start writing your content here...</p>',
    },
  },
  {
    type: 'WelcomeBlock',
    label: 'Welcome Hero',
    category: 'Hero',
    description: 'Animated hero section with typing effect, profile photo, and CTA button.',
    schema: {
      typingPrefix: { label: 'Typing Prefix', type: 'text', placeholder: "I'm ready to" },
      typingSuffix: { label: 'Typing Suffix', type: 'text', placeholder: '' },
      typingTexts: { label: 'Typing Texts (array)', type: 'json', placeholder: '["solve problems", "build products"]' },
      description: { label: 'Description (HTML)', type: 'textarea', placeholder: 'Short intro paragraph...' },
      ctaLabel: { label: 'CTA Button Label', type: 'text', placeholder: 'Contact me' },
      ctaHref: { label: 'CTA Button Link', type: 'url', placeholder: '#contact' },
      resumeLabel: { label: 'Resume Button Label', type: 'text', placeholder: 'Resume' },
      resumeUrl: { label: 'Resume URL', type: 'url', placeholder: 'https://...' },
    },
    defaultProps: {
      typingPrefix: "I'm ready to",
      typingSuffix: '',
      typingTexts: ['solve problems', 'build products', 'create solutions', 'make a difference', 'be challenged', 'freelance'],
      description: '<strong>Product-focused Full-Stack Developer</strong> with <strong>3+ years of experience</strong>.',
      ctaLabel: 'Contact me',
      ctaHref: '#contact',
      resumeLabel: 'Resume',
      resumeUrl: 'https://drive.google.com/file/d/17Ya5AC2nvcvccN-bS2pFsKFIm5v8dcWN/view?usp=drive_link',
    },
  },
]
