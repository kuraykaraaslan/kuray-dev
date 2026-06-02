import type { Metadata } from 'next'
import SettingsPageClient from './SettingsPageClient'

// Private, per-user page — never index it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function SettingsPage() {
  return <SettingsPageClient />
}
