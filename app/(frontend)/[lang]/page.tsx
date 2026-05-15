import Welcome from '@/components/frontend/Features/Hero/Welcome'
import Toolbox from '@/components/frontend/Features/Hero/Toolbox'
import Contact from '@/components/frontend/Features/Hero/Contact'
import ProjectsHero from '@/components/frontend/Features/Hero/Projects'
import type { Metadata } from 'next'
import MetadataHelper from '@/helpers/MetadataHelper'
import ProjectService from '@/services/ProjectService'
//import AppointmentCalendar from '@/components/frontend/Features/Appointments/AppointmentCalendar'; // Uncomment this line to enable the Appointment Calendar feature
import ToastContainerClient from '@/components/common/UI/Toast/ToastContainerClient'
import 'react-toastify/dist/ReactToastify.css'
import OfflineIndicator from '@/components/common/UI/Indicators/OfflineIndicator'
import { AVAILABLE_LANGUAGES } from '@/types/common/I18nTypes'
import { buildAlternates, buildLangUrl, getOgLocale } from '@/helpers/HreflangHelper'
import { getPageMetadata } from '@/libs/localize/getDictionary'

const NEXT_PUBLIC_APPLICATION_HOST = process.env.NEXT_PUBLIC_APPLICATION_HOST

type Props = {
  params: Promise<{ lang: string }>
}

const DEFAULT_HOME_TITLE = 'Kuray Karaaslan | Full-Stack Developer (React, Next.js, Java)'
const DEFAULT_HOME_DESCRIPTION =
  'Product-focused Full-Stack Developer with 3+ years of experience. Specialized in React, Next.js, Node.js, Java Spring Boot, and multi-tenant SaaS architectures. Available for freelance.'
const DEFAULT_HOME_KEYWORDS = [
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
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { canonical, languages } = buildAlternates(lang, '', [...AVAILABLE_LANGUAGES])
  const dictMeta = await getPageMetadata(lang, 'home')
  const title = dictMeta.title || DEFAULT_HOME_TITLE
  const description = dictMeta.description || DEFAULT_HOME_DESCRIPTION
  const keywords = dictMeta.keywords && dictMeta.keywords.length ? dictMeta.keywords : DEFAULT_HOME_KEYWORDS

  return {
    // absolute prevents the layout template ("%s | Kuray Karaaslan") from
    // duplicating the brand name — the homepage title already includes it.
    title: { absolute: title },
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
          alt: 'Kuray Karaaslan - Full-Stack Developer',
          type: 'image/png',
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
  const dictMeta = await getPageMetadata(lang, 'home')
  const title = dictMeta.title || DEFAULT_HOME_TITLE
  const description = dictMeta.description || DEFAULT_HOME_DESCRIPTION

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

  const breadcrumbs = [{ name: 'Home', url }]

  let portfolioItems: { name: string; url: string; image?: string }[] = []
  try {
    const projects = await ProjectService.getAllProjectSlugs()
    portfolioItems = projects.slice(0, 10).map((p: any) => ({
      name: p.title,
      url: `${NEXT_PUBLIC_APPLICATION_HOST}/projects/${p.slug}`,
      image: p.image || undefined,
    }))
  } catch {
    portfolioItems = []
  }

  return (
    <>
      {MetadataHelper.generateJsonLdScripts(jsonLdMeta, {
        includeProfilePage: true,
        breadcrumbs,
        portfolioItems,
      })}
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
