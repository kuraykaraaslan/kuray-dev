import { revalidatePath } from 'next/cache'
import redisInstance from '@/libs/redis'

const SITEMAP_REDIS_KEY = 'sitemap:root'

/**
 * Purge the sitemap Redis cache and revalidate the /sitemap.xml path.
 * Call this after any content mutation (create/update/delete post or project).
 */
export async function invalidateSitemapCache(): Promise<void> {
  try {
    await redisInstance.del(SITEMAP_REDIS_KEY)
  } catch {
    // Redis unavailable — non-fatal
  }
  revalidatePath('/sitemap.xml')
}
