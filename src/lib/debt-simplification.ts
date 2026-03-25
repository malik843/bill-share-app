import { DebtAdjustment, Expense } from '@/types';

export function calculateBalances(expenses: Expense[]): Map<string, number> {
  const balances = new Map<string, number>();

  for (const expense of expenses) {
    const totalAmount = expense.amount;
    
    // The person who paid gets a positive balance
    balances.set(
      expense.paidById,
      (balances.get(expense.paidById) || 0) + totalAmount
    );

    // People involved in the split get negative balances
    for (const split of expense.splits) {
      balances.set(
        split.userId,
        (balances.get(split.userId) || 0) - split.amount
      );
    }
  }

  return balances;
}

export function simplifyDebts(balances: Map<string, number>): DebtAdjustment[] {
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const [userId, amount] of balances.entries()) {
    if (amount < -0.01) {
      debtors.push({ userId, amount: -amount });
    } else if (amount > 0.01) {
      creditors.push({ userId, amount });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const adjustments: DebtAdjustment[] = [];

  let i = 0; 
  let j = 0; 

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    const minAmount = Math.min(debtor.amount, creditor.amount);

    adjustments.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: parseFloat(minAmount.toFixed(2)),
    });

    debtor.amount -= minAmount;
    creditor.amount -= minAmount;

    if (debtor.amount < 0.01) i++;
    if (creditor.amount < 0.01) j++;
  }

  return adjustments;
}
