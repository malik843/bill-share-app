import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const AddMemberSchema = z.object({
  email: z.string().email(),
})

// POST /api/groups/[groupId]/members — Add a member by email
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Verify caller is a member (ideally ADMIN, but MEMBER can invite too for now)
  const callerMembership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  })
  if (!callerMembership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = AddMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Find user by email
  const targetUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  })
  if (!targetUser) {
    return NextResponse.json(
      { error: 'User not found. They need to sign up first.' },
      { status: 404 }
    )
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: targetUser.id,
        groupId,
      },
    },
  })
  if (existing) {
    return NextResponse.json(
      { error: 'User is already a member of this group' },
      { status: 409 }
    )
  }

  const member = await prisma.groupMember.create({
    data: {
      userId: targetUser.id,
      groupId,
      role: 'MEMBER',
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json(member, { status: 201 })
}
