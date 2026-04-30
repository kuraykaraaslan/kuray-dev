import { prisma } from '@/libs/prisma'
import type { BlockData, DynamicPageParams } from '@/dtos/DynamicPageDTO'

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
        isPublished: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  }

  static async mergeParams(params: DynamicPageParams) : Promise<string> {
    const { dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF } = params
    return [dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF]
      .filter((slug): slug is string => typeof slug === 'string')
      .join('/')
  }

  static async getById(dynamicPageId: string) {
    return prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
    })
  }

  static async getBySlug(slug: string) {
    return prisma.dynamicPage.findUnique({
      where: { slug },
    })
  }

  static async create(data: {
    slug: string
    title: string
    description?: string
    keywords?: string[]
    sections?: BlockData[]
    metadata?: Record<string, unknown>
    isPublished?: boolean
  }) {
    return prisma.dynamicPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords ?? [],
        sections: (data.sections ?? []) as object[],
        metadata: data.metadata as object | undefined,
        isPublished: data.isPublished ?? false,
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
      isPublished?: boolean
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
        ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      },
    })
  }

  static async delete(dynamicPageId: string) {
    return prisma.dynamicPage.delete({
      where: { dynamicPageId },
    })
  }
}
