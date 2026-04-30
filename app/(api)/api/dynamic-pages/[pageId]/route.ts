import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import { UpdateDynamicPageSchema } from '@/dtos/DynamicPageDTO'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const page = await DynamicPageService.getById(pageId)
    if (!page) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json({ page })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const { pageId } = await params
    const body = await request.json()
    const parsed = UpdateDynamicPageSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const page = await DynamicPageService.update(pageId, parsed.data)
    return NextResponse.json({ page })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request })

    const { pageId } = await params
    await DynamicPageService.delete(pageId)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ message: msg }, { status: 500 })
  }
}
