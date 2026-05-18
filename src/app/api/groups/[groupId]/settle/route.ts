import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const SettleSchema = z.object({
  debtorId: z.string().min(1),
  creditorId: z.string().min(1),
  amount: z.number().positive(),
  title: z.string().optional(),
  note: z.string().optional(),
})

// POST /api/groups/[groupId]/settle — Record a manual settlement
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Must be a member
  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await req.json()
  const parsed = SettleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { debtorId, creditorId, amount, title, note } = parsed.data

  // Only the debtor or creditor can mark as settled
  if (session.user.id !== debtorId && session.user.id !== creditorId) {
    return NextResponse.json({ error: 'You are not party to this settlement' }, { status: 403 })
  }

  const settlement = await prisma.settlement.create({
    data: {
      groupId,
      debtorId,
      creditorId,
      amount,
      title: title ?? 'Settlement',
      note,
      status: 'SETTLED',
      settledAt: new Date(),
    },
    include: {
      debtor: { select: { id: true, name: true, image: true } },
      creditor: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json(settlement, { status: 201 })
}

// GET /api/groups/[groupId]/settle — List all settlements for a group
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  const membership = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: session.user.id, groupId } },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: {
      debtor: { select: { id: true, name: true, image: true } },
      creditor: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(settlements)
}
