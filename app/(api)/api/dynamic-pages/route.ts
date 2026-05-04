import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import { CreateDynamicPageSchema } from '@/dtos/DynamicPageDTO'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'

export async function GET() {
  try {
    const pages = await DynamicPageService.getAll()
    return NextResponse.json({ pages })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
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
