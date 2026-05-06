import { NextResponse } from 'next/server'

// POST /api/pay/initialize — Paystack payment initialization (stub)
export async function POST() {
  return NextResponse.json(
    { error: 'Payment integration coming soon', stub: true },
    { status: 501 }
  )
}
