import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Authentication Callback',
  description: 'Completing authentication for your Kuray Karaaslan account.',
}

export default function CallbackLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
