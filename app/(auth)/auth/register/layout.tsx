import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Create Account',
  description: 'Create a new Kuray Karaaslan account.',
}

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
