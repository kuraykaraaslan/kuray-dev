import { NextResponse } from 'next/server'
import DynamicPageBlockService from '@/services/DynamicPageBlockService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

type Params = { params: Promise<{ blockId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { blockId } = await params
  try {
    const blocks = await DynamicPageBlockService.getAll()
    const block = blocks.find((b) => b.blockId === blockId)
    if (!block) return NextResponse.json({ message: 'Not found' }, { status: 404 })
    return NextResponse.json({ block })
  } catch {
    return NextResponse.json({ message: 'Failed' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { blockId } = await params
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })
    const body = await request.json()
    const block = await DynamicPageBlockService.update(blockId, body)
    return NextResponse.json({ block })
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message
    return NextResponse.json({ message: msg ?? 'Failed to update block' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { blockId } = await params
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })
    await DynamicPageBlockService.delete(blockId)
    return NextResponse.json({ message: 'Deleted' })
  } catch (err: unknown) {
    const msg = (err as { message?: string })?.message
    const status = msg?.includes('System blocks') ? 403 : 500
    return NextResponse.json({ message: msg ?? 'Failed to delete block' }, { status })
  }
}
