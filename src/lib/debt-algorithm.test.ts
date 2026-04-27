// lib/debt-algorithm.test.ts

import { describe, test, expect } from 'vitest'
import { simplifyDebts, computeNetBalances } from './debt-algorithm'

describe('simplifyDebts', () => {
  test('three-person dinner: A paid, B and C owe', () => {
    const balances = [
      { userId: 'alice', amount: 20 },   // alice is owed ₦20
      { userId: 'bob', amount: -10 },    // bob owes ₦10
      { userId: 'charlie', amount: -10 } // charlie owes ₦10
    ]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ from: 'bob', to: 'alice', amount: 10 })
    expect(result[1]).toEqual({ from: 'charlie', to: 'alice', amount: 10 })
  })

  test('chain debt collapses: A owes B, B owes C → A pays C directly', () => {
    const balances = [
      { userId: 'A', amount: -10 },
      { userId: 'B', amount: 0 },
      { userId: 'C', amount: 10 }
    ]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({ from: 'A', to: 'C', amount: 10 })
  })

  test('no debts when all balances are zero', () => {
    const balances = [
      { userId: 'A', amount: 0 },
      { userId: 'B', amount: 0 }
    ]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(0)
  })

  test('handles floating point rounding', () => {
    const balances = [
      { userId: 'A', amount: 10.333 },
      { userId: 'B', amount: -5.167 },
      { userId: 'C', amount: -5.166 }
    ]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(2)
    // All amounts should be rounded to 2 decimal places
    result.forEach(t => {
      expect(Number(t.amount.toFixed(2))).toBe(t.amount)
    })
  })

  test('single person — no transactions needed', () => {
    const balances = [{ userId: 'solo', amount: 0 }]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(0)
  })

  test('complex 4-person group', () => {
    // A paid ₦3000, B paid ₦1000. Split equally among A, B, C, D = ₦1000 each.
    // Net: A = +2000, B = 0, C = -1000, D = -1000
    const balances = [
      { userId: 'A', amount: 2000 },
      { userId: 'B', amount: 0 },
      { userId: 'C', amount: -1000 },
      { userId: 'D', amount: -1000 }
    ]
    const result = simplifyDebts(balances)
    expect(result).toHaveLength(2)
    const total = result.reduce((sum, t) => sum + t.amount, 0)
    expect(total).toBe(2000)
  })
})

describe('computeNetBalances', () => {
  test('single expense split equally', () => {
    const expenses = [
      {
        payerId: 'alice',
        splits: [
          { userId: 'alice', amount: 10 },
          { userId: 'bob', amount: 10 },
          { userId: 'charlie', amount: 10 }
        ]
      }
    ]
    const balances = computeNetBalances(expenses)
    const aliceBalance = balances.find(b => b.userId === 'alice')!
    const bobBalance = balances.find(b => b.userId === 'bob')!
    const charlieBalance = balances.find(b => b.userId === 'charlie')!

    expect(aliceBalance.amount).toBe(20)  // paid 30, owes 10 = net +20
    expect(bobBalance.amount).toBe(-10)
    expect(charlieBalance.amount).toBe(-10)
  })

  test('multiple expenses net out correctly', () => {
    const expenses = [
      {
        payerId: 'A',
        splits: [
          { userId: 'A', amount: 50 },
          { userId: 'B', amount: 50 }
        ]
      },
      {
        payerId: 'B',
        splits: [
          { userId: 'A', amount: 50 },
          { userId: 'B', amount: 50 }
        ]
      }
    ]
    const balances = computeNetBalances(expenses)
    // Both paid 100 total, both owe 100 total = net zero for each
    balances.forEach(b => {
      expect(Math.abs(b.amount)).toBeLessThan(0.01)
    })
  })
})
