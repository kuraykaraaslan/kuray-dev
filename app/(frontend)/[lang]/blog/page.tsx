import Newsletter from '@/components/frontend/Features/Newsletter'
import Feed from '@/components/frontend/Features/Blog/Feed'
import CategoryBullets from '@/components/frontend/Features/CategoryBullets'
import type { Metadata } from 'next'
import MetadataHelper from '@/helpers/MetadataHelper'
import PostService from '@/services/PostService'
import { INDEXABLE_LANGUAGES } from '@/types/common/I18nTypes'
import { buildAlternates, getOgLocale, robotsFor } from '@/helpers/HreflangHelper'
import { getPageMetadata } from '@/libs/localize/getDictionary'
import { SITE_URL } from '@/libs/seo/siteUrl'

const NEXT_PUBLIC_APPLICATION_HOST = SITE_URL

type Props = {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string; search?: string; [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { lang } = await params
  const sp = await searchParams
  const page = parseInt((sp.page as string) || '1', 10)
  const isPaginated = page > 1

  const { canonical, languages, indexableLangs } = buildAlternates(lang, '/blog', INDEXABLE_LANGUAGES)
  const indexable = indexableLangs.includes(lang) && !isPaginated
  const { title, description, keywords } = await getPageMetadata(lang, 'blog')

  return {
    // dictionary titles already include "| Kuray Karaaslan", so bypass the
    // layout template to prevent the suffix from being appended twice.
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
          alt: 'Kuray Karaaslan Blog',
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

const BlogPage = async ({ params }: { params: Promise<{ lang: string }> }) => {
  const { lang } = await params
  const { title, description } = await getPageMetadata(lang, 'blog')

  // Metadata for JSON-LD only (meta tags handled by export above)
  const jsonLdMetadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog`,
      images: [`${NEXT_PUBLIC_APPLICATION_HOST}/assets/img/og.png`],
    },
  }

  const breadcrumbs = [
    { name: 'Home', url: `${NEXT_PUBLIC_APPLICATION_HOST}/` },
    { name: 'Blog', url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog` },
  ]

  // Fetch first page of posts for CollectionPage schema
  let collectionPosts: { title: string; url: string; datePublished?: string }[] = []
  try {
    const response = await PostService.getAllPosts({ page: 0, pageSize: 6, status: 'PUBLISHED', lang })
    collectionPosts = response.posts.map((p) => ({
      title: p.title,
      url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog/${p.category.slug}/${p.slug}`,
      datePublished: p.createdAt?.toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching posts for CollectionPage schema:', error)
  }

  return (
    <>
      {MetadataHelper.generateJsonLdScripts(jsonLdMetadata, {
        breadcrumbs,
        collectionPage:
          collectionPosts.length > 0
            ? {
                url: `${NEXT_PUBLIC_APPLICATION_HOST}/blog`,
                name: title,
                description,
                posts: collectionPosts,
              }
            : undefined,
      })}
      <Feed />
      <CategoryBullets />
      <Newsletter />
    </>
  )
}

export default BlogPage
