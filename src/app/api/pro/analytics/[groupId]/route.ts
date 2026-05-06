import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Gate behind Pro subscription
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  })
  if (user?.plan !== 'PRO') {
    return NextResponse.json(
      { error: 'Pro subscription required', upgrade: true },
      { status: 403 }
    )
  }

  const { groupId } = await params
  const { searchParams } = new URL(req.url)
  const months = parseInt(searchParams.get('months') ?? '3')

  const since = new Date()
  since.setMonth(since.getMonth() - months)

  const expenses = await prisma.expense.findMany({
    where: {
      groupId,
      createdAt: { gte: since },
    },
    include: {
      splits: { where: { userId: session.user.id } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // Group by month
  const byMonth = expenses.reduce<Record<string, number>>((acc, exp) => {
    const key = exp.createdAt.toISOString().slice(0, 7) // "2025-03"
    const myShare = exp.splits[0]?.amount ?? 0
    acc[key] = (acc[key] ?? 0) + myShare
    return acc
  }, {})

  // Total spent by each member
  const memberTotals = await prisma.expenseSplit.groupBy({
    by: ['userId'],
    where: {
      expense: {
        groupId,
        createdAt: { gte: since },
      },
    },
    _sum: { amount: true },
  })

  // Average expense
  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0)
  const avgExpense = expenses.length > 0 ? totalAmount / expenses.length : 0

  return NextResponse.json({
    byMonth,
    memberTotals,
    totalExpenses: expenses.length,
    totalAmount,
    avgExpense,
    period: { months, since },
  })
}
