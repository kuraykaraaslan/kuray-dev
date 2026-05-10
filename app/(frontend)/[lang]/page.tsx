import DynamicPageRenderer from '@/components/dynamic/Renderer'
import DynamicPageService from '@/services/DynamicPageService'
import Welcome from '@/components/frontend/Features/Hero/Welcome'
import Toolbox from '@/components/frontend/Features/Hero/Toolbox'
import Contact from '@/components/frontend/Features/Hero/Contact'
import ProjectsHero from '@/components/frontend/Features/Hero/Projects'
import type { Metadata } from 'next'
import MetadataHelper from '@/helpers/MetadataHelper'
import ToastContainerClient from '@/components/common/UI/Toast/ToastContainerClient'
import 'react-toastify/dist/ReactToastify.css'
import OfflineIndicator from '@/components/common/UI/Indicators/OfflineIndicator'
import { AVAILABLE_LANGUAGES } from '@/types/common/I18nTypes'
import { buildAlternates, buildLangUrl, getOgLocale } from '@/helpers/HreflangHelper'
import { getPageMetadata } from '@/libs/localize/getDictionary'
import type { BlockData } from '@/components/dynamic/types'

const NEXT_PUBLIC_APPLICATION_HOST = process.env.NEXT_PUBLIC_APPLICATION_HOST

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { canonical, languages } = buildAlternates(lang, '', [...AVAILABLE_LANGUAGES])
  const { title, description, keywords } = await getPageMetadata(lang, 'home')

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
  const { title, description } = await getPageMetadata(lang, 'home')

  const jsonLdMeta: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      images: [`${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`],
    },
  }

  const rawDynamicPage = await DynamicPageService.getBySlug('')

  if (rawDynamicPage?.status === 'PUBLISHED') {
    const dynamicPage = DynamicPageService.applyTranslation(rawDynamicPage, lang)
    const sections = Array.isArray(dynamicPage.sections)
      ? (dynamicPage.sections as unknown as BlockData[])
      : []

    return (
      <>
        {MetadataHelper.generateJsonLdScripts(jsonLdMeta, { includeProfilePage: true })}
        <DynamicPageRenderer sections={sections} />
        <ToastContainerClient />
        <OfflineIndicator />
      </>
    )
  }

  return (
    <>
      {MetadataHelper.generateJsonLdScripts(jsonLdMeta, { includeProfilePage: true })}
      <Welcome />
      <Toolbox />
      <ProjectsHero />
      <Contact />
      <ToastContainerClient />
      <OfflineIndicator />
    </>
  )
}

export default HomePage
