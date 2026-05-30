import { ReactNode } from 'react'
import { Metadata } from 'next'
import BlogLayoutClient from './layout.client'
import { SITE_URL } from '@/libs/seo/siteUrl'

const NEXT_PUBLIC_APPLICATION_HOST = SITE_URL

export const metadata: Metadata = {
  alternates: {
    types: {
      'application/rss+xml': `${NEXT_PUBLIC_APPLICATION_HOST}/feed.xml`,
    },
  },
}

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <BlogLayoutClient />
    </>
  )
}

export default Layout
