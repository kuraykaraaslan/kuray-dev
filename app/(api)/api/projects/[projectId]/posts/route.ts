import { NextResponse } from 'next/server'
import ProjectService from '@/services/ProjectService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)

    const result = await ProjectService.getProjectPosts(projectId, page, pageSize)
    return NextResponse.json({ posts: result.posts, total: result.total, page, pageSize })
  } catch (error: any) {
    console.error(error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
