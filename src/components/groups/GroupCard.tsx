'use client'

import React from 'react'
import { Users, ChevronRight, Trash2 } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface GroupCardProps {
  group: {
    id: string
    name: string
    icon?: string | null
    currency: string
    members: Array<{ user: { id: string; name: string | null; image: string | null } }>
    _count?: { expenses: number }
  }
  currentUserId?: string
  /** Positive = owed to you, negative = you owe, 0/null = settled */
  netBalance?: number
  isAdmin?: boolean
  onOpen: (groupId: string) => void
  onDelete?: (groupId: string) => void
}

export default function GroupCard({
  group,
  currentUserId,
  netBalance,
  isAdmin,
  onOpen,
  onDelete,
}: GroupCardProps) {
  const reduced = useReducedMotion()

  const balanceColor =
    netBalance == null || Math.abs(netBalance) < 0.01
      ? 'text-muted-foreground'
      : netBalance > 0
      ? 'text-emerald-500'
      : 'text-rose-500'

  const balanceLabel =
    netBalance == null || Math.abs(netBalance) < 0.01
      ? 'Settled'
      : netBalance > 0
      ? `+₦${netBalance.toLocaleString()}`
      : `-₦${Math.abs(netBalance).toLocaleString()}`

  return (
    <div
      className={`group-card flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-all cursor-pointer ${reduced ? '' : 'hover:-translate-y-0.5 hover:shadow-sm'}`}
      onClick={() => onOpen(group.id)}
    >
      {/* Icon */}
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
        {group.icon || <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground truncate">{group.name}</p>
        <p className="text-xs text-muted-foreground">
          {group.members.length} member{group.members.length !== 1 ? 's' : ''} · {group._count?.expenses ?? 0} expense{(group._count?.expenses ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Balance Badge */}
      <span className={`text-sm font-bold ${balanceColor} flex-shrink-0`}>{balanceLabel}</span>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isAdmin && onDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(group.id) }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Delete group"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  )
}
