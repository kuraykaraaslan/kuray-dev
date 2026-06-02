import DynamicPageRenderer from '@/components/dynamic/Renderer'
import DynamicPageService from '@/services/DynamicPageService'
import type { BlockData } from '@/components/dynamic/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DynamicPageParams } from '@/dtos/DynamicPageDTO'
import MetadataHelper from '@/helpers/MetadataHelper'
import { buildAlternates, buildLangUrl, robotsFor, getOgLocale } from '@/helpers/HreflangHelper'
import { SITE_URL } from '@/libs/seo/siteUrl'

interface Props {
    params: Promise<DynamicPageParams>
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {

    const resolvedParams = await params
    const lang = (resolvedParams as Record<string, string>).lang ?? 'en'
    const mergedSlug = await DynamicPageService.mergeParams(resolvedParams)

    const rawPage = await DynamicPageService.getBySlug(mergedSlug)

    if (!rawPage || rawPage.status !== 'PUBLISHED') {
        return { title: 'Not Found' }
    }

    const page = DynamicPageService.applyTranslation(rawPage, lang)
    const meta = (page.metadata as Record<string, unknown> | null) || {}

    // A lang-prefixed dynamic page is indexable only if it actually has a
    // translation for that language; otherwise it serves the English fallback.
    const path = `/${page.slug}`
    const contentLangs = ['en', ...(rawPage.translations?.map((t) => t.lang) ?? [])]
    const { canonical, languages, indexableLangs } = buildAlternates(lang, path, contentLangs)
    const indexable = indexableLangs.includes(lang)

    return {
        // bare title — layout template "%s | Kuray Karaaslan" adds the suffix
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        authors: [{ name: 'Kuray Karaaslan', url: SITE_URL }],
        alternates: { canonical, languages },
        robots: robotsFor(indexable),
        openGraph: {
            title: (meta.ogTitle as string) || `${page.title} | Kuray Karaaslan`,
            description: (meta.ogDescription as string) || page.description || '',
            url: canonical,
            images: [
                {
                    url: (meta.ogImage as string) || '/assets/img/og.png',
                    width: 1200,
                    height: 630,
                },
            ],
            locale: getOgLocale(lang),
            siteName: 'Kuray Karaaslan',
        },
        twitter: {
            card: (meta.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
            title: (meta.twitterTitle as string) || page.title,
            description: (meta.twitterDescription as string) || page.description || '',
            images: [(meta.ogImage as string) || '/assets/img/og.png'],
            site: '@kuraykaraaslan',
            creator: '@kuraykaraaslan',
        },
    }
}

export async function Page({ params }: Props) {
    const resolvedParams = await params
    const lang = (resolvedParams as Record<string, string>).lang ?? 'en'
    const mergedSlug = await DynamicPageService.mergeParams(resolvedParams)

    const rawPage = await DynamicPageService.getBySlug(mergedSlug)

    if (!rawPage || rawPage.status !== 'PUBLISHED') {
        notFound()
    }

    const page = DynamicPageService.applyTranslation(rawPage, lang)
    const sections = Array.isArray(page.sections) ? (page.sections as unknown as BlockData[]) : []

    // Structured data: WebSite + Organization + BreadcrumbList. Dynamic pages
    // previously emitted no JSON-LD at all.
    const url = buildLangUrl(lang, `/${page.slug}`)
    const meta = (page.metadata as Record<string, unknown> | null) || {}
    const jsonLdMeta: Metadata = {
        title: page.title,
        description: page.description,
        openGraph: {
            title: page.title,
            description: page.description || '',
            url,
            images: [(meta.ogImage as string) || `${SITE_URL}/assets/img/og.png`],
        },
    }
    const breadcrumbs = [
        { name: 'Home', url: buildLangUrl(lang, '') },
        { name: page.title, url },
    ]

    return (
        <main className="min-h-screen bg-base-100">
            {MetadataHelper.generateJsonLdScripts(jsonLdMeta, { breadcrumbs })}
            <DynamicPageRenderer sections={sections} />
        </main>
    )
}
