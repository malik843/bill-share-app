import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const body = await req.text()   // raw — before any parsing
  const signature = req.headers.get('x-paystack-signature')

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Paystack secret not configured' }, { status: 503 })
  }

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(body)
    // stub
    return NextResponse.json({ received: true, event })
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }
}
