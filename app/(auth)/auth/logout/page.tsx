import type { Metadata } from 'next'
import LogoutClient from './LogoutClient'

export const metadata: Metadata = {
  title: 'Sign Out',
  robots: { index: false, follow: false },
}

export default function LogoutPage() {
  return <LogoutClient />
}
