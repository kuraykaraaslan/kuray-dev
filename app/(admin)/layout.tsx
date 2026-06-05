import { Suspense, ReactNode } from 'react'
import 'react-toastify/dist/ReactToastify.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

const Layout = ({ children }: { children: ReactNode }) => {
  return <Suspense>{children}</Suspense>
}

export default Layout
