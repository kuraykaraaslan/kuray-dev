import { notFound } from 'next/navigation'
import DynamicPageService from '@/services/DynamicPageService'
import DynamicPageCoverService from '@/services/DynamicPageCoverService'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  const { pageId } = await params
  const page = await DynamicPageService.getById(pageId)

  if (!page) return notFound()

  const imageResponse = await DynamicPageCoverService.getImage(page)
  if (!imageResponse) return notFound()

  return imageResponse
}
