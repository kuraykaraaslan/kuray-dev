import './globals.css'
import { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import ConsentedAnalytics from '@/components/frontend/ConsentedAnalytics'
import ServiceWorkerRegistrar from '@/components/common/PWA/ServiceWorkerRegistrar'
import ThemeSyncScript from '@/components/common/UI/ThemeSyncScript'
import type { Metadata, Viewport } from 'next'
import { cookies, headers } from 'next/headers'
import type { AppTheme } from '@/types/ui/UITypes'
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE, getDirection, type AppLanguage } from '@/types/common/I18nTypes'
import { SITE_URL } from '@/libs/seo/siteUrl'

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-sans',
})

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
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    title: 'Kuray Karaaslan',
    statusBarStyle: 'black-translucent',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
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
  viewportFit: 'cover',
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1d2a35' },
  ],
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()])
  const themeCookie = cookieStore.get('theme')?.value as AppTheme | undefined
  const theme: AppTheme = themeCookie === 'light' ? 'light' : 'dark'

  // `x-lang` is set by middleware.ts from the first path segment; the root layout
  // is the only place that can render <html>, so the locale travels via header.
  const headerLang = headerStore.get('x-lang')
  const lang: AppLanguage =
    headerLang && (AVAILABLE_LANGUAGES as readonly string[]).includes(headerLang)
      ? (headerLang as AppLanguage)
      : DEFAULT_LANGUAGE
  const dir = getDirection(lang)

  return (
    <html lang={lang} dir={dir} data-theme={theme} className={`${inter.variable} antialiased scroll-smooth focus:scroll-auto`}>
      <head>
        <meta charSet="utf-8" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="alternate" type="application/rss+xml" title="Kuray Karaaslan Blog (RSS)" href="/feed.xml" />
        <link rel="alternate" type="application/atom+xml" title="Kuray Karaaslan Blog (Atom)" href="/feed.atom" />
        <link rel="alternate" type="application/feed+json" title="Kuray Karaaslan Blog (JSON Feed)" href="/feed.json" />
        {/* CORS origins need crossorigin so the browser shares the connection */}
        <link rel="preconnect" href="https://kuray-dev.s3.amazonaws.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.gravatar.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://avatars.githubusercontent.com" crossOrigin="anonymous" />
        {/* GA/GTM are non-blocking — dns-prefetch is sufficient */}
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        {/* Speculation Rules API — instant prefetch of likely-next navigations (Chrome 123+) */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              prefetch: [
                { source: 'list', urls: ['/blog', '/projects', '/about'] },
              ],
            }),
          }}
        />
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
        <ConsentedAnalytics />
        <main id="main-content">{children}</main>
      </body>
    </html>
  )
}
