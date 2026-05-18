import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/groups/[groupId] — Get group details + members
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Verify user is a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, image: true, avatar: true } },
        },
      },
      _count: { select: { expenses: true, settlements: true } },
    },
  })

  if (!group) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(group)
}

// DELETE /api/groups/[groupId] — Admin-only group deletion
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Only ADMIN can delete
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  })
  if (!membership || membership.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
  }

  // Cascade: delete splits → expenses → settlements → members → group
  await prisma.$transaction([
    prisma.expenseSplit.deleteMany({ where: { expense: { groupId } } }),
    prisma.expense.deleteMany({ where: { groupId } }),
    prisma.settlement.deleteMany({ where: { groupId } }),
    prisma.groupMember.deleteMany({ where: { groupId } }),
    prisma.group.delete({ where: { id: groupId } }),
  ])

  return NextResponse.json({ success: true })
}
