import { NextResponse } from 'next/server'
import { prisma } from '@/libs/prisma'
import AuthMiddleware from '@/services/AuthService/AuthMiddleware'
import { z } from 'zod'

const SetProjectSchema = z.object({
  projectId: z.string().nullable(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    await AuthMiddleware.authenticateUserByRequest({ request, requiredUserRole: 'ADMIN' })

    const { postId } = await params
    const body = await request.json()

    const parsed = SetProjectSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors.map((e) => e.message).join(', ') },
        { status: 400 }
      )
    }

    const projectId = parsed.data.projectId || null

    if (projectId) {
      const project = await prisma.project.findUnique({
        where: { projectId },
        select: { projectId: true, deletedAt: true },
      })
      if (!project || project.deletedAt) {
        return NextResponse.json({ message: 'Project not found' }, { status: 404 })
      }
    }

    const post = await prisma.post.update({
      where: { postId },
      data: { projectId },
      select: { postId: true, projectId: true },
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error(error.message)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
