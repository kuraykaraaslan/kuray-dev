import { SITE_URL } from '@/libs/seo/siteUrl'

/**
 * IndexNow protocol — instantly notifies Bing/Yandex/Seznam/Naver of URL changes.
 * https://www.indexnow.org/documentation
 *
 * Setup:
 *  1. Set INDEXNOW_KEY env var to a UUID (e.g. `crypto.randomUUID()` once).
 *  2. Place a file at `public/<INDEXNOW_KEY>.txt` containing just the key.
 *  3. Call `IndexNowService.ping(urls)` when a post is published/updated.
 */
export default class IndexNowService {
  private static readonly ENDPOINT = 'https://api.indexnow.org/IndexNow'

  static get key(): string | undefined {
    return process.env.INDEXNOW_KEY
  }

  static async ping(urls: string | string[]): Promise<void> {
    const key = this.key
    if (!key) return

    const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean)
    if (list.length === 0) return

    const host = new URL(SITE_URL).host

    try {
      await fetch(this.ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host,
          key,
          keyLocation: `${SITE_URL}/${key}.txt`,
          urlList: list,
        }),
      })
    } catch (error) {
      console.error('IndexNow ping failed:', error)
    }
  }
}
