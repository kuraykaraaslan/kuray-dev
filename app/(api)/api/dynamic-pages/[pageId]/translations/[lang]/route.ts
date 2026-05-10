import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { AppLanguageEnum } from '@/types/common/I18nTypes'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string; lang: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

    const { pageId, lang } = await params

    if (!AppLanguageEnum.options.includes(lang as any)) {
      return NextResponse.json({ message: 'Invalid language code' }, { status: 400 })
    }

    const page = await DynamicPageService.getById(pageId)
    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 })
    }

    await DynamicPageService.deleteTranslation(pageId, lang)
    return NextResponse.json({ message: 'Translation deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
