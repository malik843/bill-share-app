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

  // Get user details for this group to enrich the settlements
  const members = await prisma.groupMember.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true, image: true, avatar: true, email: true } } }
  })
  const userMap = new Map(members.map(m => [m.userId, m.user]))

  const netBalances = computeNetBalances(expenses)
  const rawSettlements = simplifyDebts(netBalances)

  const settlements = rawSettlements.map(s => ({
    from: s.from,
    to: s.to,
    amount: s.amount,
    fromUser: userMap.get(s.from) || { name: 'Unknown', id: s.from },
    toUser: userMap.get(s.to) || { name: 'Unknown', id: s.to }
  }))

  return NextResponse.json({ netBalances, settlements })
}
