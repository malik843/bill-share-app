import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/pay/initialize — Paystack payment initialization (stub)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  return NextResponse.json(
    { error: 'Payment integration coming soon', stub: true },
    { status: 501 }
  )
}
