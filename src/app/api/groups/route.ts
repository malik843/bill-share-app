import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100),
  icon: z.string().optional(),
  currency: z.string().default('NGN'),
})

// POST /api/groups — Create a new group
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = CreateGroupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, icon, currency } = parsed.data

  const group = await prisma.group.create({
    data: {
      name,
      icon,
      currency,
      members: {
        create: {
          userId: session.user.id,
          role: 'ADMIN',
        },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
    },
  })

  return NextResponse.json(group, { status: 201 })
}

// GET /api/groups — List all groups the user belongs to
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const groups = await prisma.group.findMany({
    where: {
      members: {
        some: { userId: session.user.id },
      },
    },
    include: {
      members: {
        include: { user: { select: { id: true, name: true, image: true } } },
      },
      _count: { select: { expenses: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(groups)
}
