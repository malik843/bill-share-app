// lib/debt-algorithm.ts
// Pure functions — zero dependencies, fully testable in isolation.

export interface Balance {
  userId: string
  amount: number // positive = owed money, negative = owes money
}

export interface Transaction {
  from: string  // debtor userId
  to: string    // creditor userId
  amount: number
}

/**
 * Takes raw net balances per user and returns the minimum number
 * of transactions needed to settle all debts in the group.
 *
 * Algorithm: greedy matching of largest debtor to largest creditor.
 * Not always globally optimal, but O(n log n) and good enough for
 * groups up to ~20 people.
 */
export function simplifyDebts(balances: Balance[]): Transaction[] {
  const transactions: Transaction[] = []

  // Separate into debtors (negative balance) and creditors (positive balance)
  const debtors = balances
    .filter(b => b.amount < -0.01) // -0.01 threshold to avoid float noise
    .map(b => ({ ...b }))
    .sort((a, b) => a.amount - b.amount) // most negative first

  const creditors = balances
    .filter(b => b.amount > 0.01)
    .map(b => ({ ...b }))
    .sort((a, b) => b.amount - a.amount) // most positive first

  let i = 0 // debtor pointer
  let j = 0 // creditor pointer

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]

    const settleAmount = Math.min(Math.abs(debtor.amount), creditor.amount)

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settleAmount * 100) / 100, // round to 2dp
    })

    debtor.amount += settleAmount
    creditor.amount -= settleAmount

    if (Math.abs(debtor.amount) < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return transactions
}

/**
 * Computes net balance per user from raw expense splits.
 * Call this before simplifyDebts.
 */
export function computeNetBalances(
  expenses: Array<{
    payerId: string
    splits: Array<{ userId: string; amount: number }>
  }>
): Balance[] {
  const balanceMap = new Map<string, number>()

  for (const expense of expenses) {
    // Payer gets credited the full amount
    balanceMap.set(
      expense.payerId,
      (balanceMap.get(expense.payerId) ?? 0) +
        expense.splits.reduce((s, sp) => s + sp.amount, 0)
    )

    // Each splitter gets debited their share
    for (const split of expense.splits) {
      balanceMap.set(
        split.userId,
        (balanceMap.get(split.userId) ?? 0) - split.amount
      )
    }
  }

  return Array.from(balanceMap.entries()).map(([userId, amount]) => ({
    userId,
    amount,
  }))
}
