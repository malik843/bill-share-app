'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface Split {
  userName: string
  amount: number
}

interface Props {
  expense: {
    id: string
    title: string
    amount: number
    payer: string
    splits: Split[]
    createdAt?: string
  }
  isNew?: boolean
}

/**
 * Animation 1 — Receipt Reveal
 * When isNew=true, the card drops in from above like a receipt printing,
 * then split pills stagger-fan beneath it.
 */
export default function ExpenseCard({ expense, isNew = false }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const splitsRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!isNew || !cardRef.current) return

    const validSplits = splitsRef.current.filter(Boolean) as HTMLSpanElement[]

    const tl = gsap.timeline()

    // Card drops in from above
    tl.fromTo(
      cardRef.current,
      { y: -20, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
    )

    // Split pills stagger in beneath it
    if (validSplits.length > 0) {
      tl.fromTo(
        validSplits,
        { y: -8, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          stagger: 0.08,
          ease: 'power2.out',
        },
        '-=0.15'
      )
    }
  }, [isNew])

  return (
    <div
      ref={cardRef}
      className="expense-card"
      style={{ opacity: isNew ? 0 : 1 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="font-semibold text-sm text-foreground">{expense.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {expense.payer} paid
          </p>
        </div>
        <span className="font-bold text-sm text-foreground">
          ₦{expense.amount.toLocaleString()}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {expense.splits.map((split, i) => (
          <span
            key={split.userName}
            ref={(el) => {
              splitsRef.current[i] = el
            }}
            className="expense-split-pill"
          >
            {split.userName} owes ₦{split.amount.toLocaleString()}
          </span>
        ))}
      </div>

      {expense.createdAt && (
        <p className="text-[10px] text-muted-foreground mt-3 opacity-60">
          {new Date(expense.createdAt).toLocaleDateString('en-NG', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      )}
    </div>
  )
}
