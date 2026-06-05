import type { Metadata } from 'next'
import CallbackClient from './CallbackClient'

export const metadata: Metadata = {
  title: 'Authenticating…',
  robots: { index: false, follow: false },
}

export default function CallbackPage() {
  return <CallbackClient />
}
