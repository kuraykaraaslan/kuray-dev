import { NextResponse } from 'next/server'
import DynamicPageService from '@/services/DynamicPageService'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { z } from 'zod'
import { AppLanguageEnum } from '@/types/common/I18nTypes'
import { BlockDataSchema } from '@/types/content/PageTypes'

const UpsertTranslationSchema = z.object({
  lang: AppLanguageEnum,
  title: z.string().min(1, 'Title is required'),
  description: z.string().nullable().optional(),
  sections: z.array(BlockDataSchema).default([]),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    const { pageId } = await params
    const translations = await DynamicPageService.getTranslations(pageId)
    return NextResponse.json({ translations })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pageId: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

    const { pageId } = await params
    const body = await request.json()

    const parsed = UpsertTranslationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const page = await DynamicPageService.getById(pageId)
    if (!page) {
      return NextResponse.json({ message: 'Page not found' }, { status: 404 })
    }

    const { lang, title, description, sections } = parsed.data
    const translation = await DynamicPageService.upsertTranslation(pageId, lang, {
      title,
      description,
      sections,
    })

    return NextResponse.json({ translation })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
