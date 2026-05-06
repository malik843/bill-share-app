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

// ─── Pro Feature: Settlement Explainer ──────────────────────────────────────

export interface ExplainerStep {
  step: number
  description: string
  debtors: Balance[]
  creditors: Balance[]
  transaction: Transaction | null
}

/**
 * Like simplifyDebts, but also returns human-readable explanation steps
 * showing WHY each transaction was chosen. Used in the Pro explainer modal.
 */
export function simplifyDebtsWithExplanation(
  balances: Balance[]
): { transactions: Transaction[]; steps: ExplainerStep[] } {
  const transactions: Transaction[] = []
  const steps: ExplainerStep[] = []

  const debtors = balances
    .filter(b => b.amount < -0.01)
    .map(b => ({ ...b }))
    .sort((a, b) => a.amount - b.amount) // most negative first

  const creditors = balances
    .filter(b => b.amount > 0.01)
    .map(b => ({ ...b }))
    .sort((a, b) => b.amount - a.amount) // most positive first

  let stepNum = 1
  let i = 0
  let j = 0

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i]
    const creditor = creditors[j]
    const settleAmount = Math.min(Math.abs(debtor.amount), creditor.amount)

    const transaction: Transaction = {
      from: debtor.userId,
      to: creditor.userId,
      amount: Math.round(settleAmount * 100) / 100,
    }

    steps.push({
      step: stepNum++,
      description:
        `${debtor.userId} owes the most (₦${Math.abs(debtor.amount).toFixed(0)}). ` +
        `${creditor.userId} is owed the most (₦${creditor.amount.toFixed(0)}). ` +
        `Match them: pay ₦${settleAmount.toFixed(0)}.`,
      debtors: debtors.map(d => ({ ...d })),
      creditors: creditors.map(c => ({ ...c })),
      transaction,
    })

    transactions.push(transaction)
    debtor.amount += settleAmount
    creditor.amount -= settleAmount

    if (Math.abs(debtor.amount) < 0.01) i++
    if (creditor.amount < 0.01) j++
  }

  return { transactions, steps }
}
