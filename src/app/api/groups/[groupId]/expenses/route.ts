import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ExpenseSchema = z.object({
  title: z.string().min(1).max(100),
  amount: z.number().positive(),
  splits: z
    .array(
      z.object({
        userId: z.string(),
        amount: z.number().positive(),
      })
    )
    .min(1),
})

// POST /api/groups/[groupId]/expenses — Create an expense
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Verify caller is a member
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = ExpenseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { title, amount, splits } = parsed.data

  // Validate: splits must sum to the total amount
  const splitsTotal = splits.reduce((s, sp) => s + sp.amount, 0)
  if (Math.abs(splitsTotal - amount) > 0.01) {
    return NextResponse.json(
      {
        error: `Splits sum (${splitsTotal}) must equal amount (${amount})`,
      },
      { status: 400 }
    )
  }

  const expense = await prisma.expense.create({
    data: {
      groupId,
      payerId: session.user.id,
      title,
      amount,
      splits: {
        create: splits.map(s => ({
          userId: s.userId,
          amount: s.amount,
        })),
      },
    },
    include: {
      splits: true,
      payer: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json(expense, { status: 201 })
}

// GET /api/groups/[groupId]/expenses — List all expenses
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Verify membership
  const membership = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: {
      payer: { select: { id: true, name: true, image: true, avatar: true } },
      splits: {
        include: {
          user: { select: { id: true, name: true, image: true, avatar: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(expenses)
}
