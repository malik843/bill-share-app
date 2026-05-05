'use client'

import React from 'react'

interface GroupLimitBarProps {
  count: number
  limit?: number
  onUpgrade?: () => void
}

export default function GroupLimitBar({ count, limit = 3, onUpgrade }: GroupLimitBarProps) {
  const pct = Math.min((count / limit) * 100, 100)
  const atLimit = count >= limit

  return (
    <div className={`rounded-2xl border p-4 ${atLimit ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-card'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">
          {count} / {limit} groups used
        </span>
        {atLimit && (
          <button
            onClick={onUpgrade}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Upgrade →
          </button>
        )}
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${atLimit ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Upgrade to Pro for unlimited groups.
        </p>
      )}
    </div>
  )
}
