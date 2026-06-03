import { NextResponse } from 'next/server'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import InAppNotificationService from '@/services/InAppNotificationService'

export const runtime = 'nodejs'

/** PATCH /api/notifications/:id — mark a single notification as read */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { user } = await AuthMiddleware.authenticateUserByRequest({
      request,
      requiredUserRole: 'ADMIN',
    })

    const { notificationId } = await params
    await InAppNotificationService.markAsRead(user.userId, notificationId)

    return NextResponse.json({ message: 'Marked as read' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}

/** DELETE /api/notifications/:id — delete a single notification */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ notificationId: string }> }
) {
  try {
    const { user } = await AuthMiddleware.authenticateUserByRequest({
      request,
      requiredUserRole: 'ADMIN',
    })

    const { notificationId } = await params
    await InAppNotificationService.deleteOne(user.userId, notificationId)

    return NextResponse.json({ message: 'Notification deleted' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
