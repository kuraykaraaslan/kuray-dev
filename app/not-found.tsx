import type { Metadata } from 'next'
import NotFoundClient from '@/components/frontend/NotFoundClient'

// 404 responses already return HTTP 404 (not indexed); make the intent explicit.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return <NotFoundClient />
}
