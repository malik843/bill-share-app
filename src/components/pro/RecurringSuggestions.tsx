'use client'

import { RefreshCw, Sparkles } from 'lucide-react'
import type { RecurringPattern } from '@/lib/recurring-detector'

interface Props {
  patterns: RecurringPattern[]
  onSetup: (pattern: RecurringPattern) => void
}

export default function RecurringSuggestions({ patterns, onSetup }: Props) {
  if (patterns.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Recurring Detected</span>
        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-0.5">
          <Sparkles className="w-2.5 h-2.5" /> PRO
        </span>
      </div>
      {patterns.slice(0, 3).map((p, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-3 rounded-xl transition-colors hover:bg-white/5"
          style={{ background: 'rgba(127,119,221,0.06)', border: '1px solid rgba(127,119,221,0.1)' }}
        >
          <div>
            <p className="text-sm font-semibold text-foreground">{p.title}</p>
            <p className="text-xs text-muted-foreground">
              ~&#8358;{p.averageAmount.toLocaleString()} / {p.frequency}
              <span className="ml-2 text-purple-400/60">{Math.round(p.confidence * 100)}% match</span>
            </p>
          </div>
          <button
            onClick={() => onSetup(p)}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            Set up
          </button>
        </div>
      ))}
    </div>
  )
}
