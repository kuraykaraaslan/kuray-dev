import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Sign Out',
  description: 'Sign out of your Kuray Karaaslan account.',
}

export default function LogoutLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
