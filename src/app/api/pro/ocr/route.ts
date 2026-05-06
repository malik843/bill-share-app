import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface VisionResponse {
  responses: Array<{
    textAnnotations?: Array<{ description: string }>
  }>
}

interface ParsedReceipt {
  items: Array<{ name: string; amount: number }>
  total: number | null
  confidence: 'high' | 'low'
}

export async function POST(req: NextRequest) {
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

  const apiKey = process.env.GOOGLE_VISION_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'OCR service not configured' },
      { status: 503 }
    )
  }

  const { imageBase64 } = await req.json()
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return NextResponse.json({ error: 'imageBase64 is required' }, { status: 400 })
  }

  const visionRes = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requests: [
          {
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          },
        ],
      }),
    }
  )

  if (!visionRes.ok) {
    return NextResponse.json(
      { error: 'Vision API error' },
      { status: 502 }
    )
  }

  const visionData: VisionResponse = await visionRes.json()
  const rawText =
    visionData.responses[0]?.textAnnotations?.[0]?.description ?? ''

  const parsed = parseReceiptText(rawText)
  return NextResponse.json(parsed)
}

function parseReceiptText(text: string): ParsedReceipt {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const items: Array<{ name: string; amount: number }> = []
  let total: number | null = null

  // Match lines like: "Jollof Rice    2,500" or "Chicken  ₦3,400.00"
  const itemRegex = /^(.+?)\s+[₦]?([\d,]+(?:\.\d{2})?)$/
  const totalRegex = /total|amount due|grand total/i

  for (const line of lines) {
    const match = line.match(itemRegex)
    if (!match) continue

    const name = match[1].trim()
    const amount = parseFloat(match[2].replace(/,/g, ''))

    if (totalRegex.test(name)) {
      total = amount
    } else if (amount > 0 && amount < 500_000) {
      items.push({ name, amount })
    }
  }

  return {
    items,
    total,
    confidence: items.length > 0 ? 'high' : 'low',
  }
}
