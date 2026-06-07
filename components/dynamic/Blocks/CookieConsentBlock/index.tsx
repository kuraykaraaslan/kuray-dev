'use client'

import { usePathname } from 'next/navigation'
import type { BlockDefinition } from '../../types'
import { EditorPreview } from './EditorPreview'
import { CookieConsentBar } from './CookieConsentBar'

function CookieConsentBlock(rawProps: Record<string, unknown>) {
  const pathname = usePathname()
  if (pathname?.includes('/admin/pages/')) return <EditorPreview rawProps={rawProps} />
  return <CookieConsentBar rawProps={rawProps} />
}

export const CookieConsentBlockDefinition: BlockDefinition = {
  type: 'cookie-consent',
  label: 'Cookie Consent',
  category: 'System',
  description: 'Site-wide cookie consent banner. Add to any published page — renders as a fixed bar at the top or bottom of the viewport.',
  icon: '🍪',
  tags: ['cookie', 'consent', 'gdpr', 'privacy', 'banner'],
  defaultProps: {
    message: 'We use cookies to improve your experience and analyze site usage. By continuing, you agree to our',
    privacyPolicyText: 'Privacy Policy',
    privacyPolicyUrl: '/privacy-policy',
    acceptLabel: 'Accept',
    declineLabel: 'Decline',
    showDecline: true,
    position: 'bottom',
    backgroundColor: '#1a1818',
    textColor: 'rgba(255,255,255,0.6)',
    borderColor: 'rgba(255,255,255,0.1)',
    acceptBgColor: 'rgba(255,255,255,0.1)',
    acceptTextColor: '#ffffff',
    declineTextColor: 'rgba(255,255,255,0.5)',
    isActive: true,
    showDelay: 0,
  },
  schema: {
    // --- Content ---
    message: {
      label: 'Message',
      type: 'textarea',
      group: 'Content',
      description: 'Text shown before the privacy policy link.',
    },
    privacyPolicyText: { label: 'Privacy Policy link text', type: 'text', group: 'Content' },
    privacyPolicyUrl: { label: 'Privacy Policy URL', type: 'url', group: 'Content' },

    // --- Buttons ---
    acceptLabel: { label: 'Accept button label', type: 'text', group: 'Buttons' },
    declineLabel: { label: 'Decline button label', type: 'text', group: 'Buttons' },
    showDecline: { label: 'Show decline button', type: 'boolean', group: 'Buttons' },
    acceptBgColor: { label: 'Accept background color', type: 'color', group: 'Buttons' },
    acceptTextColor: { label: 'Accept text color', type: 'color', group: 'Buttons' },
    declineTextColor: { label: 'Decline text color', type: 'color', group: 'Buttons' },

    // --- Appearance ---
    position: {
      label: 'Position',
      type: 'select',
      group: 'Appearance',
      options: [
        { label: 'Bottom', value: 'bottom' },
        { label: 'Top', value: 'top' },
      ],
    },
    backgroundColor: { label: 'Background color', type: 'color', group: 'Appearance' },
    textColor: { label: 'Text color', type: 'color', group: 'Appearance' },
    borderColor: { label: 'Border color', type: 'color', group: 'Appearance' },

    // --- Scheduling ---
    isActive: { label: 'Active', type: 'boolean', group: 'Scheduling' },
    showDelay: {
      label: 'Show delay (seconds)',
      type: 'number',
      min: 0,
      max: 30,
      step: 1,
      group: 'Scheduling',
    },
  },
  Component: CookieConsentBlock as unknown as BlockDefinition['Component'],
}

export default CookieConsentBlock
