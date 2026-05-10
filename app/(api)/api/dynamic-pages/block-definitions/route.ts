import { NextResponse } from 'next/server'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

export async function GET() {
  try {
    const blocks = await DynamicPageBlockService.getAll()
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
