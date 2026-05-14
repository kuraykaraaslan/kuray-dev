import OGService from '@/services/OGService'
import { PostWithData } from '@/types/content/BlogTypes'

const CACHE_PREFIX = 'post:og:'

export default class PostCoverService {
  private static key(postId: string) {
    return `${CACHE_PREFIX}${postId}`
  }

  static async resetAll() {
    return OGService.clearByPrefix(CACHE_PREFIX)
  }

  static async resetById(postId: string) {
    await OGService.clearByKey(this.key(postId))
    return { cleared: true }
  }

  static async getImage(post: PostWithData): Promise<Response | null> {
    if (!post.postId) return null

    const title = post.title.length > 110 ? post.title.slice(0, 100) + '…' : post.title

    return OGService.generate(
      {
        title,
        coverImage: post.image ?? null,
        badge: 'Blog Post',
      },
      this.key(post.postId)
    )
  }

  static async generateAllOgImages(posts: PostWithData[]) {
    for (const post of posts) {
      await this.getImage(post)
    }
    return { generated: posts.length }
  }
}
