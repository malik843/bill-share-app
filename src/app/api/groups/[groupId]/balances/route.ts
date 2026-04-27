import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { computeNetBalances, simplifyDebts } from '@/lib/debt-algorithm'

// GET /api/groups/[groupId]/balances — Compute net balances + settlements
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params

  // Verify user is a member of this group
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

  // Pull all expenses with their splits
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    include: { splits: true },
  })

  const netBalances = computeNetBalances(expenses)
  const settlements = simplifyDebts(netBalances)

  return NextResponse.json({ netBalances, settlements })
}
