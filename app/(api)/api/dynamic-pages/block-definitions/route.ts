import { NextResponse } from 'next/server'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { CODE_BLOCK_META } from '@/components/dynamic/CodeBlocksMeta'

export async function GET() {
  try {
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

    const blocks = [
      ...codeBlocks,
      ...dbBlocks.map((b) => ({ ...b, source: 'db' as const })),
    ]

    return NextResponse.json({ blocks })
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
