import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your Kuray Karaaslan account.',
}

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
