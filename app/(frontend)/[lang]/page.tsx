import DynamicPageRenderer from '@/components/dynamic/Renderer'
import DynamicPageService from '@/services/DynamicPageService'
import type { Metadata } from 'next'
import MetadataHelper from '@/helpers/MetadataHelper'
import ToastContainerClient from '@/components/common/UI/Toast/ToastContainerClient'
import 'react-toastify/dist/ReactToastify.css'
import OfflineIndicator from '@/components/common/UI/Indicators/OfflineIndicator'
import { AVAILABLE_LANGUAGES } from '@/types/common/I18nTypes'
import { buildAlternates, buildLangUrl, getOgLocale } from '@/helpers/HreflangHelper'
import type { BlockData } from '@/components/dynamic/types'
import { notFound } from 'next/navigation'

const NEXT_PUBLIC_APPLICATION_HOST = process.env.NEXT_PUBLIC_APPLICATION_HOST

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { canonical, languages } = buildAlternates(lang, '', [...AVAILABLE_LANGUAGES])

  const rawPage = await DynamicPageService.getBySlug('')
  const page = rawPage ? DynamicPageService.applyTranslation(rawPage, lang) : null
  const title = page?.title ?? 'Kuray Karaaslan'
  const description = page?.description ?? ''
  const keywords = Array.isArray(rawPage?.keywords) ? (rawPage.keywords as string[]) : []

  return {
    title,
    description,
    keywords,
    robots: { index: true, follow: true },
    authors: [{ name: 'Kuray Karaaslan', url: `${NEXT_PUBLIC_APPLICATION_HOST}` }],
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [
        {
          url: `${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`,
          width: 1200,
          height: 630,
          alt: 'Kuray Karaaslan - Software Developer',
        },
      ],
      locale: getOgLocale(lang),
      siteName: 'Kuray Karaaslan',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@kuraykaraaslan',
      creator: '@kuraykaraaslan',
      title,
      description,
      images: [`${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`],
    },
    alternates: { canonical, languages },
  }
}

const HomePage = async ({ params }: Props) => {
  const { lang } = await params
  const url = buildLangUrl(lang, '')

  const rawPage = await DynamicPageService.getBySlug('')
  if (!rawPage || rawPage.status !== 'PUBLISHED') return notFound()

  const page = DynamicPageService.applyTranslation(rawPage, lang)
  const sections = Array.isArray(page.sections) ? (page.sections as unknown as BlockData[]) : []

  const jsonLdMeta: Metadata = {
    title: page.title,
    description: page.description ?? '',
    openGraph: {
      title: page.title,
      description: page.description ?? '',
      type: 'website',
      url,
      images: [`${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`],
    },
  }

  return (
    <>
      {MetadataHelper.generateJsonLdScripts(jsonLdMeta, { includeProfilePage: true })}
      <DynamicPageRenderer sections={sections} />
      <ToastContainerClient />
      <OfflineIndicator />
    </>
  )
}

export default HomePage
