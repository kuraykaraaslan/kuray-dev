import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import { CreateDynamicPageSchema } from '@/dtos/DynamicPageDTO'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const search = searchParams.get('search') || undefined
    const sortKey = searchParams.get('sortKey') || undefined
    const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc'
    const status = searchParams.get('status') || undefined

    const { pages, total } = await DynamicPageService.getAll({
      page,
      pageSize,
      search,
      sortKey,
      sortDir,
      status,
    })

    return NextResponse.json({ pages, total, page, pageSize })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in GET /api/dynamic-pages:', error)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const body = await request.json()
    const parsed = CreateDynamicPageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const page = await DynamicPageService.create(parsed.data)
    return NextResponse.json({ page }, { status: 201 })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in POST /api/dynamic-pages:', error)
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
