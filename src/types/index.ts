export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bvnVerified: boolean;
  createdAt: string;
}

export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
}

export interface Expense {
  id: string;
  groupId: string;
  paidById: string;
  amount: number;
  description: string;
  date: string;
  splits: ExpenseSplit[];
}

export interface ExpenseSplit {
  userId: string;
  amount: number;
}

export interface ExpenseGroup {
  id: string;
  name: string;
  description?: string;
  members: User[];
  expenses: Expense[];
  createdAt: string;
}

export interface DebtAdjustment {
  fromUserId: string;
  toUserId: string;
  amount: number;
}
