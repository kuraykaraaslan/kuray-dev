'use client'
import Welcome, { type WelcomeProps } from '@/components/frontend/Features/Hero/Welcome'
import type { BlockDefinition } from '../types'

function WelcomeBlock(rawProps: Record<string, unknown>) {
  const props: WelcomeProps = {
    typingPrefix: rawProps.typingPrefix as string | undefined,
    typingSuffix: rawProps.typingSuffix as string | undefined,
    typingTexts: Array.isArray(rawProps.typingTexts) ? (rawProps.typingTexts as string[]) : undefined,
    description: rawProps.description as string | undefined,
    ctaLabel: rawProps.ctaLabel as string | undefined,
    ctaHref: rawProps.ctaHref as string | undefined,
    resumeLabel: rawProps.resumeLabel as string | undefined,
    resumeUrl: rawProps.resumeUrl as string | undefined,
  }
  return <Welcome {...props} />
}

export const WelcomeBlockDefinition: BlockDefinition = {
  type: 'WelcomeBlock',
  label: 'Welcome Hero',
  category: 'Hero',
  description: 'Animated hero section with typing effect, profile photo, and CTA button.',
  defaultProps: {
    typingPrefix: "I'm ready to",
    typingSuffix: '',
    typingTexts: ['solve problems', 'build products', 'create solutions', 'make a difference', 'be challenged', 'freelance'],
    description: '<strong>Product-focused Full-Stack Developer</strong> with <strong>3+ years of experience</strong> delivering robust, scalable software solutions.',
    ctaLabel: 'Contact me',
    ctaHref: '#contact',
    resumeLabel: 'Resume',
    resumeUrl: 'https://drive.google.com/file/d/17Ya5AC2nvcvccN-bS2pFsKFIm5v8dcWN/view?usp=drive_link',
  },
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
  Component: WelcomeBlock as unknown as BlockDefinition['Component'],
}
