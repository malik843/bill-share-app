'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, UserCircle2, Receipt, ArrowRightLeft, CheckCircle, Loader2, Trash2 } from 'lucide-react'
import gsap from 'gsap'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useToast } from '@/components/providers/ToastProvider'
import EmptyState from '@/components/ui/EmptyState'

type Tab = 'expenses' | 'members' | 'settlements'

interface GroupDetailPanelProps {
  groupId: string
  currentUserId?: string
  isAdmin?: boolean
  onClose: () => void
  onSettle: (debtorId: string, creditorId: string, amount: number, name: string) => void
  onDelete?: (groupId: string) => void
}

export default function GroupDetailPanel({ groupId, currentUserId, isAdmin, onClose, onSettle, onDelete }: GroupDetailPanelProps) {
  const [tab, setTab] = useState<Tab>('expenses')
  const [group, setGroup] = useState<any>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [balances, setBalances] = useState<any>(null)
  const [settlements, setSettlements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { addToast } = useToast()

  useEffect(() => {
    const ctx = reduced ? null : gsap.context(() => {
      gsap.fromTo(panelRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' })
    })
    return () => ctx?.revert()
  }, [reduced])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [gRes, eRes, bRes, sRes] = await Promise.all([
          fetch(`/api/groups/${groupId}`),
          fetch(`/api/groups/${groupId}/expenses`),
          fetch(`/api/groups/${groupId}/balances`),
          fetch(`/api/groups/${groupId}/settle`),
        ])
        if (gRes.ok) setGroup(await gRes.json())
        if (eRes.ok) setExpenses(await eRes.json())
        if (bRes.ok) setBalances(await bRes.json())
        if (sRes.ok) setSettlements(await sRes.json())
      } catch {
        addToast('Failed to load group data', 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [groupId, addToast])

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'expenses', label: 'Expenses', icon: <Receipt className="w-4 h-4" /> },
    { id: 'members', label: 'Members', icon: <UserCircle2 className="w-4 h-4" /> },
    { id: 'settlements', label: 'Settle', icon: <ArrowRightLeft className="w-4 h-4" /> },
  ]

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return (
    <div ref={panelRef} className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="font-bold text-base text-foreground">{group?.name ?? '…'}</h3>
        <div className="flex items-center gap-1">
          {isAdmin && onDelete && (
            <button 
              onClick={() => onDelete(groupId)} 
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              title="Delete Group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer" title="Close Panel">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-border px-4">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer -mb-px ${
              tab === t.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Expenses Tab */}
            {tab === 'expenses' && (
              expenses.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No expenses yet"
                  description="Add your first expense to start splitting costs."
                />
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {expenses.map((e: any) => {
                    const isOld = new Date(e.createdAt) < thirtyDaysAgo
                    const myShare = e.splits.find((s: any) => s.userId === currentUserId)?.amount
                    const iPaid = e.payerId === currentUserId
                    return (
                      <div
                        key={e.id}
                        className={`relative p-3 rounded-xl border ${isOld ? 'opacity-50' : ''} ${iPaid ? 'border-l-4 border-l-emerald-500 border-border' : myShare ? 'border-l-4 border-l-rose-500 border-border' : 'border-border'} bg-muted/20`}
                      >
                        {isOld && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-xl text-xs font-medium text-muted-foreground">
                            🔒 Free plan: 30-day history only
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-foreground">{e.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {e.payer?.name ?? 'Unknown'} paid · {new Date(e.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₦{e.amount.toLocaleString()}</p>
                            {myShare && (
                              <p className={`text-xs font-medium ${iPaid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {iPaid ? 'you paid' : `your share: ₦${myShare.toLocaleString()}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Members Tab */}
            {tab === 'members' && (
              group?.members?.length === 0 ? (
                <EmptyState icon={UserCircle2} title="No members" description="Invite members to start splitting." />
              ) : (
                <div className="space-y-2">
                  {group?.members?.map((m: any) => {
                    const balance = balances?.netBalances?.find((b: any) => b.userId === m.userId)?.amount ?? 0
                    return (
                      <div key={m.userId} className="flex items-center gap-3 py-2">
                        <UserCircle2 className="w-9 h-9 text-muted-foreground flex-shrink-0" strokeWidth={1.5} />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{m.user.name ?? 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground capitalize">{m.role.toLowerCase()}</p>
                        </div>
                        <span className={`text-sm font-bold ${Math.abs(balance) < 0.01 ? 'text-muted-foreground' : balance > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {Math.abs(balance) < 0.01 ? 'Settled' : balance > 0 ? `+₦${balance.toLocaleString()}` : `-₦${Math.abs(balance).toLocaleString()}`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            )}

            {/* Settlements Tab */}
            {tab === 'settlements' && (
              <div className="space-y-3">
                {/* Calculated debts from algorithm */}
                {balances?.settlements?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Outstanding</p>
                    <div className="space-y-2">
                      {balances.settlements.map((s: any, i: number) => {
                        const isMe = s.from === currentUserId
                        return (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/20">
                            <div className="flex-1">
                              <p className="text-sm font-medium">
                                <span className={isMe ? 'text-rose-500' : 'text-emerald-500'}>{isMe ? 'You' : (s.fromUser?.name ?? 'Unknown')}</span>
                                {' → '}
                                <span>{isMe ? (s.toUser?.name ?? 'Unknown') : 'You'}</span>
                              </p>
                              <p className="text-xs text-muted-foreground">₦{s.amount.toLocaleString()}</p>
                            </div>
                            {isMe && (
                              <button
                                onClick={() => onSettle(s.from, s.to, s.amount, s.toUser?.name ?? 'Unknown')}
                                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-500 transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" /> Settle
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Recorded settlements */}
                {settlements.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4">History</p>
                    <div className="space-y-2">
                      {settlements.map((s: any) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/10">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{s.debtor?.name} → {s.creditor?.name}</p>
                            <p className="text-xs text-muted-foreground">{new Date(s.settledAt ?? s.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm font-bold text-foreground">₦{s.amount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {balances?.settlements?.length === 0 && settlements.length === 0 && (
                  <EmptyState icon={ArrowRightLeft} title="All settled up!" description="No outstanding debts in this group." />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
