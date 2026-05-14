import OGService from '@/services/OGService'

interface PageInfo {
  dynamicPageId: string
  title: string
  description?: string | null
}

const CACHE_PREFIX = 'dynpage:og:'

export default class DynamicPageCoverService {
  private static key(pageId: string) {
    return `${CACHE_PREFIX}${pageId}`
  }

  static async resetById(pageId: string) {
    await OGService.clearByKey(this.key(pageId))
    return { cleared: true }
  }

  static async getImage(page: PageInfo): Promise<Response | null> {
    if (!page.dynamicPageId) return null

    return OGService.generate(
      {
        title: page.title,
        description: page.description,
        badge: 'kuraykaraaslan.com',
      },
      this.key(page.dynamicPageId)
    )
  }
}
