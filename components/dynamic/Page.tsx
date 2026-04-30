import DynamicPageRenderer from '@/components/dynamic/Renderer'
import DynamicPageService from '@/services/DynamicPageService'
import type { BlockData } from '@/components/dynamic/types'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DynamicPageParams } from '@/dtos/DynamicPageDTO'

interface Props {
    params: Promise<DynamicPageParams>
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {

    const mergedSlug = await DynamicPageService.mergeParams(await params)

    const page = await DynamicPageService.getBySlug(mergedSlug)

    if (!page || page.status !== 'PUBLISHED') {
        return { title: 'Not Found' }
    }

    const host = process.env.NEXT_PUBLIC_APPLICATION_HOST
    const meta = (page.metadata as Record<string, unknown> | null) || {}

    return {
        title: `${page.title} | Kuray Karaaslan`,
        description: page.description,
        keywords: page.keywords,
        alternates: { canonical: `${host}/${page.slug}` },
        openGraph: {
            title: (meta.ogTitle as string) || `${page.title} | Kuray Karaaslan`,
            description: (meta.ogDescription as string) || page.description || '',
            url: `${host}/${page.slug}`,
            images: [
                {
                    url: (meta.ogImage as string) || '/assets/img/og.png',
                    width: 1200,
                    height: 630,
                },
            ],
            locale: 'en_US',
            siteName: 'Kuray Karaaslan',
        },
        twitter: {
            card: (meta.twitterCard as 'summary' | 'summary_large_image') || 'summary_large_image',
            title: (meta.twitterTitle as string) || page.title,
            description: (meta.twitterDescription as string) || page.description || '',
            images: [(meta.ogImage as string) || '/assets/img/og.png'],
            site: '@avantleap',
        },
    }
}

export async function Page({ params }: Props) {
    const mergedSlug = await DynamicPageService.mergeParams(await params)

    const page = await DynamicPageService.getBySlug(mergedSlug)

    if (!page || page.status !== 'PUBLISHED') {
        notFound()
    }

    const sections = Array.isArray(page.sections) ? (page.sections as unknown as BlockData[]) : []

    return (
        <main className="min-h-screen bg-base-100">
            <DynamicPageRenderer sections={sections} />
        </main>
    )
}
