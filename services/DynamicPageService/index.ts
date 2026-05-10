import { prisma } from '@/libs/prisma'
import type { BlockData, DynamicPageParams } from '@/dtos/DynamicPageDTO'
import type { DynamicPageStatus } from '@/types/content/PageTypes'
import type { Prisma } from '@/generated/prisma'

type DynamicPageWithTranslations = Prisma.DynamicPageGetPayload<{
  include: { translations: true }
}>

export default class DynamicPageService {
  static async getAll() {
    return prisma.dynamicPage.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        dynamicPageId: true,
        slug: true,
        title: true,
        description: true,
        keywords: true,
        metadata: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async mergeParams(params: DynamicPageParams): Promise<string> {
    const { dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF } = params
    return [dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF]
      .filter((slug): slug is string => typeof slug === 'string')
      .join('/')
  }

  static async getById(dynamicPageId: string) {
    return prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
      include: { translations: true },
    })
  }

  static async getBySlug(slug: string) {
    return prisma.dynamicPage.findUnique({
      where: { slug },
      include: { translations: true },
    })
  }

  static applyTranslation(page: DynamicPageWithTranslations, lang: string): DynamicPageWithTranslations {
    if (!page.translations?.length || lang === 'en') return page
    const t = page.translations.find((tr) => tr.lang === lang)
    if (!t) return page
    return {
      ...page,
      title: t.title,
      description: t.description ?? page.description,
      sections: t.sections,
    }
  }

  static async create(data: {
    slug: string
    title: string
    description?: string
    keywords?: string[]
    sections?: BlockData[]
    metadata?: Record<string, unknown>
    status?: DynamicPageStatus
  }) {
    return prisma.dynamicPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords ?? [],
        sections: (data.sections ?? []) as object[],
        metadata: data.metadata as object | undefined,
        status: data.status ?? 'DRAFT',
      },
    })
  }

  static async update(
    dynamicPageId: string,
    data: {
      slug?: string
      title?: string
      description?: string
      keywords?: string[]
      sections?: BlockData[]
      metadata?: Record<string, unknown>
      status?: DynamicPageStatus
    }
  ) {
    return prisma.dynamicPage.update({
      where: { dynamicPageId },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.sections !== undefined && { sections: data.sections as object[] }),
        ...(data.metadata !== undefined && { metadata: data.metadata as object }),
        ...(data.status !== undefined && { status: data.status }),
      },
    })
  }

  static async delete(dynamicPageId: string) {
    return prisma.dynamicPage.delete({
      where: { dynamicPageId },
    })
  }

  static async getTranslations(dynamicPageId: string) {
    return prisma.dynamicPageTranslation.findMany({
      where: { dynamicPageId },
    })
  }

  static async upsertTranslation(
    dynamicPageId: string,
    lang: string,
    data: { title: string; description?: string | null; sections: BlockData[] }
  ) {
    return prisma.dynamicPageTranslation.upsert({
      where: { dynamicPageId_lang: { dynamicPageId, lang } },
      create: {
        dynamicPageId,
        lang,
        title: data.title,
        description: data.description ?? null,
        sections: data.sections as object[],
      },
      update: {
        title: data.title,
        description: data.description ?? null,
        sections: data.sections as object[],
      },
    })
  }

  static async deleteTranslation(dynamicPageId: string, lang: string) {
    return prisma.dynamicPageTranslation.delete({
      where: { dynamicPageId_lang: { dynamicPageId, lang } },
    })
  }
}
