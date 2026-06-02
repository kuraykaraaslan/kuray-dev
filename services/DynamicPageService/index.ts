import { prisma } from '@/libs/prisma'
import redisInstance from '@/libs/redis'
import type { BlockData, DynamicPageParams } from '@/dtos/DynamicPageDTO'
import type { DynamicPageStatus } from '@/types/content/PageTypes'
import { CURRENT_SCHEMA_VERSION } from '@/types/content/PageTypes'
import { migrateSections, needsMigration } from '@/components/dynamic/migrations'
import type { Prisma } from '@/generated/prisma'

type DynamicPageWithTranslations = Prisma.DynamicPageGetPayload<{
  include: { translations: true }
}>

const ALLOWED_SORT_KEYS = new Set(['title', 'slug', 'status', 'createdAt', 'updatedAt'])

export default class DynamicPageService {
  static async getAll(opts: {
    page?: number
    pageSize?: number
    search?: string
    sortKey?: string
    sortDir?: 'asc' | 'desc'
    status?: string
  } = {}) {
    const page = Math.max(0, opts.page ?? 0)
    const pageSize = Math.max(1, Math.min(opts.pageSize ?? 10, 100))
    const sortKey = ALLOWED_SORT_KEYS.has(opts.sortKey ?? '') ? (opts.sortKey as string) : 'updatedAt'
    const sortDir: 'asc' | 'desc' = opts.sortDir === 'asc' ? 'asc' : 'desc'

    const where: Prisma.DynamicPageWhereInput = {}
    if (opts.search) {
      where.OR = [
        { title: { contains: opts.search, mode: 'insensitive' } },
        { slug: { contains: opts.search, mode: 'insensitive' } },
      ]
    }
    if (opts.status) {
      where.status = opts.status as DynamicPageStatus
    }

    const [pages, total] = await Promise.all([
      prisma.dynamicPage.findMany({
        where,
        orderBy: { [sortKey]: sortDir },
        skip: page * pageSize,
        take: pageSize,
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
      }),
      prisma.dynamicPage.count({ where }),
    ])

    return { pages, total }
  }

  /** Published page slugs for the sitemap, cached under `sitemap:pages`. */
  static async getSitemapSlugs(): Promise<{ slug: string; updatedAt: Date; langs: string[] }[]> {
    const cacheKey = 'sitemap:pages'

    try {
      const cached = await redisInstance.get(cacheKey)
      if (cached) {
        return (JSON.parse(cached) as { slug: string; updatedAt: string; langs?: string[] }[]).map(
          (p) => ({
            slug: p.slug,
            updatedAt: new Date(p.updatedAt),
            langs: p.langs ?? [],
          })
        )
      }
    } catch {
      // ignore cache read errors and fall through to the DB
    }

    const pages = await prisma.dynamicPage.findMany({
      // exclude empty slugs — they would emit a duplicate of the home URL
      where: { status: 'PUBLISHED', slug: { not: '' } },
      select: {
        slug: true,
        updatedAt: true,
        translations: { select: { lang: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const result = pages.map((p) => ({
      slug: p.slug,
      updatedAt: p.updatedAt,
      langs: p.translations.map((t) => t.lang),
    }))

    try {
      await redisInstance.set(cacheKey, JSON.stringify(result), 'EX', 60 * 60)
    } catch {
      // ignore cache write errors
    }

    return result
  }

  static async mergeParams(params: DynamicPageParams): Promise<string> {
    const { dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF } = params
    return [dynamicSlugA, dynamicSlugB, dynamicSlugC, dynamicSlugD, dynamicSlugE, dynamicSlugF]
      .filter((slug): slug is string => typeof slug === 'string')
      .join('/')
  }

  static async getById(dynamicPageId: string) {
    const page = await prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
      include: { translations: true },
    })
    if (!page) return null
    return DynamicPageService.applySchemaVersion(page)
  }

  static async getBySlug(slug: string): Promise<DynamicPageWithTranslations | null> {
    const cacheKey = `pages:${slug}`
    const cached = await redisInstance.get(cacheKey)
    if (cached) {
      const raw = JSON.parse(cached) as DynamicPageWithTranslations
      return {
        ...raw,
        createdAt: new Date(raw.createdAt),
        updatedAt: new Date(raw.updatedAt),
        translations: raw.translations.map((t) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        })),
      }
    }

    const page = await prisma.dynamicPage.findUnique({
      where: { slug },
      include: { translations: true },
    })

    if (page) {
      const migrated = DynamicPageService.applySchemaVersion(page)
      await redisInstance.set(cacheKey, JSON.stringify(migrated), 'EX', 60 * 60)
      return migrated
    }

    return null
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
    const page = await prisma.dynamicPage.create({
      data: {
        slug: data.slug,
        title: data.title,
        description: data.description,
        keywords: data.keywords ?? [],
        sections: (data.sections ?? []) as object[],
        metadata: data.metadata as object | undefined,
        status: data.status ?? 'DRAFT',
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
    })
    await redisInstance.del('sitemap:pages')
    return page
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
    const existing = await prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
      select: { slug: true },
    })

    const page = await prisma.dynamicPage.update({
      where: { dynamicPageId },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.sections !== undefined && { sections: data.sections as object[] }),
        ...(data.metadata !== undefined && { metadata: data.metadata as object }),
        ...(data.status !== undefined && { status: data.status }),
        schemaVersion: CURRENT_SCHEMA_VERSION,
      },
    })

    const keysToDelete = ['sitemap:pages']
    if (existing) keysToDelete.push(`pages:${existing.slug}`)
    if (data.slug && data.slug !== existing?.slug) keysToDelete.push(`pages:${data.slug}`)
    await redisInstance.del(...keysToDelete)

    return page
  }

  static async delete(dynamicPageId: string) {
    const existing = await prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
      select: { slug: true },
    })

    const page = await prisma.dynamicPage.delete({
      where: { dynamicPageId },
    })

    const keysToDelete = ['sitemap:pages']
    if (existing) keysToDelete.push(`pages:${existing.slug}`)
    await redisInstance.del(...keysToDelete)

    return page
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
    const result = await prisma.dynamicPageTranslation.upsert({
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
    await DynamicPageService.invalidateByPageId(dynamicPageId)
    return result
  }

  static async deleteTranslation(dynamicPageId: string, lang: string) {
    const result = await prisma.dynamicPageTranslation.delete({
      where: { dynamicPageId_lang: { dynamicPageId, lang } },
    })
    await DynamicPageService.invalidateByPageId(dynamicPageId)
    return result
  }

  /**
   * Runs pending schema migrations on a page returned from the DB.
   * Mutates sections in-memory only; the caller must save to persist.
   */
  private static applySchemaVersion<T extends { sections: unknown; schemaVersion: number }>(page: T): T {
    const version = page.schemaVersion ?? 1
    if (!needsMigration(version)) return page
    const { sections } = migrateSections(page.sections as BlockData[], version)
    return { ...page, sections, schemaVersion: CURRENT_SCHEMA_VERSION }
  }

  private static async invalidateByPageId(dynamicPageId: string) {
    const page = await prisma.dynamicPage.findUnique({
      where: { dynamicPageId },
      select: { slug: true },
    })
    if (page) await redisInstance.del(`pages:${page.slug}`)
  }
}
