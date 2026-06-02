import { NextResponse, type NextRequest } from 'next/server'
import PostService from '@/services/PostService'
import PostMessages from '@/messages/PostMessages'

/**
 * Increments a post's persistent view counter. Fired once per page load by a
 * client beacon (<PostViewBeacon>) — counting was moved off the server render so
 * it tracks real client page loads rather than every HTML fetch.
 */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const { postId } = await params

    if (!postId) {
      return NextResponse.json({ message: PostMessages.OPERATION_FAILED }, { status: 400 })
    }

    await PostService.incrementViewCount(postId)

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error('Error incrementing post view:', error)
    return NextResponse.json(
      { message: error.message || PostMessages.OPERATION_FAILED },
      { status: 500 }
    )
  }
}
