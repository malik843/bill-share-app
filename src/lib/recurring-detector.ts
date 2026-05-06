// lib/recurring-detector.ts
// Pure function — detects recurring expense patterns from historical data.

export interface RecurringPattern {
  title: string
  averageAmount: number
  frequency: 'monthly' | 'weekly'
  lastSeen: Date
  confidence: number // 0-1
}

export function detectRecurringExpenses(
  expenses: Array<{ title: string; amount: number; createdAt: Date }>
): RecurringPattern[] {
  // Group by normalised title
  const groups = new Map<string, typeof expenses>()

  for (const exp of expenses) {
    const key = exp.title.toLowerCase().replace(/[^a-z0-9]/g, '')
    const existing = groups.get(key) ?? []
    groups.set(key, [...existing, exp])
  }

  const patterns: RecurringPattern[] = []

  for (const [, group] of groups) {
    if (group.length < 2) continue

    // Sort by date
    const sorted = [...group].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )

    // Calculate average gap between occurrences
    const gaps: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      const days =
        (sorted[i].createdAt.getTime() - sorted[i - 1].createdAt.getTime()) /
        (1000 * 60 * 60 * 24)
      gaps.push(days)
    }

    const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length
    const isMonthly = avgGap >= 25 && avgGap <= 35
    const isWeekly = avgGap >= 5 && avgGap <= 9

    if (!isMonthly && !isWeekly) continue

    const avgAmount =
      group.reduce((s, e) => s + e.amount, 0) / group.length

    // Confidence: how consistent are the gaps?
    const gapVariance = gaps.reduce((s, g) => s + Math.abs(g - avgGap), 0) / gaps.length
    const confidence = Math.max(0, 1 - gapVariance / avgGap)

    if (confidence < 0.5) continue

    patterns.push({
      title: group[0].title,
      averageAmount: Math.round(avgAmount),
      frequency: isMonthly ? 'monthly' : 'weekly',
      lastSeen: sorted[sorted.length - 1].createdAt,
      confidence,
    })
  }

  return patterns.sort((a, b) => b.confidence - a.confidence)
}
