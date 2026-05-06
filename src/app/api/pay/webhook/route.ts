import { NextResponse } from 'next/server'

// POST /api/pay/webhook — Paystack webhook handler (stub)
export async function POST() {
  return NextResponse.json(
    { error: 'Payment webhook not configured', stub: true },
    { status: 501 }
  )
}
