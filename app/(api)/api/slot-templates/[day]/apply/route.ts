import { NextResponse } from 'next/server'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import SlotTemplateService from '@/services/AppointmentService/SlotTemplateService'
import { ApplySlotTemplateRequestSchema } from '@/dtos/SlotDTO'
import SlotMessages from '@/messages/SlotMessages'
import { DayEnum } from '@/types/features/CalendarTypes'

export async function POST(request: NextRequest, { params }: { params: Promise<{ day: string }> }) {
  await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

  const body = await request.json()

  const parsedData = ApplySlotTemplateRequestSchema.safeParse(body)

  if (!parsedData.success) {
    return NextResponse.json(
      {
        message: parsedData.error.errors.map((err) => err.message).join(', '),
      },
      { status: 400 }
    )
  }

  const { formattedDate } = parsedData.data
  const { day } = await params

  const dayResult = DayEnum.safeParse(day)
  if (!dayResult.success) {
    return NextResponse.json({ message: SlotMessages.DAY_REQUIRED }, { status: 400 })
  }
  const validDay = dayResult.data

  const SlotTemplate = await SlotTemplateService.getSlotTemplate(validDay)

  if (!SlotTemplate || SlotTemplate.slots.length === 0) {
    return NextResponse.json({ message: SlotMessages.SLOT_TEMPLATE_NOT_FOUND }, { status: 404 })
  }

  const createdSlots = await SlotTemplateService.applySlotTemplateToDate(validDay, formattedDate)

  return NextResponse.json({ slots: createdSlots })
}
