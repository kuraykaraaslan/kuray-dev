import './globals.css'
import Script from 'next/script'
import { ReactNode } from 'react'
import WebVitals from '@/components/frontend/WebVitals'
import ServiceWorkerRegistrar from '@/components/common/PWA/ServiceWorkerRegistrar'
import ThemeSyncScript from '@/components/common/UI/ThemeSyncScript'
import type { Metadata, Viewport } from 'next'
import { cookies } from 'next/headers'
import type { AppTheme } from '@/types/ui/UITypes'
import { SITE_URL } from '@/lib/seo/siteUrl'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GOOGLE_TAG

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Kuray Karaaslan | Full-Stack Developer (React, Next.js, Java)',
    template: '%s | Kuray Karaaslan',
  },
  description:
    'Product-focused Full-Stack Developer with 3+ years of experience. Specialized in React, Next.js, Node.js, Java Spring Boot, and multi-tenant SaaS architectures. Available for freelance.',
  keywords: [
    'full-stack developer',
    'react developer',
    'next.js',
    'node.js',
    'java spring boot',
    'react native',
    'typescript',
    'saas developer',
    'freelance developer',
    'kuray karaaslan',
  ],
  authors: [{ name: 'Kuray Karaaslan', url: SITE_URL }],
  creator: 'Kuray Karaaslan',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Kuray Karaaslan',
    title: 'Kuray Karaaslan | Full-Stack Developer',
    description:
      'Full-Stack Developer building scalable SaaS, IoT, and BIM platforms with React, Next.js, and Java Spring Boot.',
    images: [
      {
        url: '/assets/img/og.png',
        width: 1200,
        height: 630,
        alt: 'Kuray Karaaslan - Full-Stack Developer',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@kuraykaraaslan',
    creator: '@kuraykaraaslan',
    title: 'Kuray Karaaslan | Full-Stack Developer',
    description: 'Full-Stack Developer (React, Next.js, Java). Available for freelance.',
    images: ['/assets/img/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    publisher: 'Kuray Karaaslan',
    'apple-mobile-web-app-title': 'Kuray Karaaslan',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1d2a35',
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('theme')?.value as AppTheme | undefined
  const theme: AppTheme = themeCookie === 'light' ? 'light' : 'dark'

  return (
    <html lang="en" data-theme={theme} className="antialiased scroll-smooth focus:scroll-auto">
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Kuray Karaaslan Blog"
          href="/feed.xml"
        />
        <meta name="apple-mobile-web-app-title" content="Kuray Karaaslan" />
        {/* Preconnect hints for faster resource loading */}
        <link rel="preconnect" href="https://kuray-dev.s3.amazonaws.com" />
        <link rel="preconnect" href="https://www.gravatar.com" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://kuray-dev.s3.amazonaws.com" />
        <link rel="dns-prefetch" href="https://www.gravatar.com" />
        <link rel="dns-prefetch" href="https://avatars.githubusercontent.com" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:text-sm focus:font-semibold"
        >
          Skip to content
        </a>
        <ThemeSyncScript />
        <ServiceWorkerRegistrar />
        <WebVitals />
        <main id="main-content">{children}</main>

        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              id="ga4-script"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', { page_path: window.location.pathname });
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
