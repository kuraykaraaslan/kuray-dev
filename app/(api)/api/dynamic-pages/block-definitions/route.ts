import { NextResponse } from 'next/server'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { CODE_BLOCK_META } from '@/components/dynamic/utils/CodeBlocksMeta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '0', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const search = (searchParams.get('search') || '').toLowerCase()

    const dbBlocks = await DynamicPageBlockService.getAll()

    const codeBlocks = CODE_BLOCK_META.map((meta) => ({
      blockId: `code:${meta.type}`,
      type: meta.type,
      label: meta.label,
      category: meta.category,
      description: meta.description,
      schema: meta.schema,
      defaultProps: meta.defaultProps,
      template: '',
      isSystem: true,
      source: 'code' as const,
    }))

    let blocks = [
      ...codeBlocks,
      ...dbBlocks.map((b) => ({ ...b, source: 'db' as const })),
    ]

    if (search) {
      blocks = blocks.filter(
        (b) =>
          b.label?.toLowerCase().includes(search) ||
          b.type?.toLowerCase().includes(search) ||
          b.category?.toLowerCase().includes(search) ||
          b.description?.toLowerCase().includes(search)
      )
    }

    const total = blocks.length
    const paginated = blocks.slice(page * pageSize, (page + 1) * pageSize)

    return NextResponse.json({ blocks: paginated, total, page, pageSize })
  } catch {
    return NextResponse.json({ message: 'Failed to fetch block definitions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })
    const body = await request.json()
    const block = await DynamicPageBlockService.create({
      type: body.type,
      label: body.label,
      category: body.category ?? 'General',
      description: body.description ?? '',
      schema: body.schema ?? {},
      defaultProps: body.defaultProps ?? {},
      template: body.template ?? '',
      isSystem: false,
    })
    return NextResponse.json({ block }, { status: 201 })
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message
    return NextResponse.json({ message: msg ?? 'Failed to create block' }, { status: 500 })
  }
}
