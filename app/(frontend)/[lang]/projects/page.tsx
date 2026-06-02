import type { Metadata } from 'next'
import Newsletter from '@/components/frontend/Features/Newsletter'
import ProjectsFeed from '@/components/frontend/Features/Projects/Feed'
import ProjectService from '@/services/ProjectService'
import MetadataHelper from '@/helpers/MetadataHelper'
import { INDEXABLE_LANGUAGES } from '@/types/common/I18nTypes'
import { buildAlternates, getOgLocale, robotsFor } from '@/helpers/HreflangHelper'
import { getPageMetadata } from '@/libs/localize/getDictionary'
import { SITE_URL } from '@/libs/seo/siteUrl'

const NEXT_PUBLIC_APPLICATION_HOST = SITE_URL

type Props = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  const { canonical, languages, indexableLangs } = buildAlternates(lang, '/projects', INDEXABLE_LANGUAGES)
  const indexable = indexableLangs.includes(lang)
  const { title, description, keywords } = await getPageMetadata(lang, 'projects')

  return {
    // dictionary titles already include "| Kuray Karaaslan"
    title: { absolute: title },
    description,
    keywords,
    robots: robotsFor(indexable),
    authors: [{ name: 'Kuray Karaaslan', url: NEXT_PUBLIC_APPLICATION_HOST || 'http://localhost:3000' }],
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
          alt: 'Kuray Karaaslan Projects',
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

export default async function ProjectsPage({ params }: Props) {
  const { lang } = await params
  const canonical = `${NEXT_PUBLIC_APPLICATION_HOST}${lang !== 'en' ? `/${lang}` : ''}/projects`
  const { title, description } = await getPageMetadata(lang, 'projects')

  const jsonLdMetadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [`${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`],
    },
  }

  const breadcrumbs = [
    { name: 'Home', url: `${NEXT_PUBLIC_APPLICATION_HOST}/` },
    { name: 'Projects', url: canonical },
  ]

  // ItemList (project carousel) + CollectionPage so the listing earns rich results
  // instead of breadcrumbs only.
  let portfolioItems: { name: string; url: string; image?: string }[] = []
  try {
    const projects = await ProjectService.getAllProjectSlugs()
    portfolioItems = projects.slice(0, 20).map((p: any) => ({
      name: p.title,
      url: `${NEXT_PUBLIC_APPLICATION_HOST}/projects/${p.slug}`,
      image: p.image || undefined,
    }))
  } catch {
    portfolioItems = []
  }

  return (
    <>
      {MetadataHelper.generateJsonLdScripts(jsonLdMetadata, {
        breadcrumbs,
        portfolioItems,
        collectionPage:
          portfolioItems.length > 0
            ? {
                url: canonical,
                name: title,
                description,
                posts: portfolioItems.map((p) => ({ title: p.name, url: p.url })),
              }
            : undefined,
      })}
      <ProjectsFeed />
      <Newsletter backgroundColor="bg-base-200" />
    </>
  )
}
