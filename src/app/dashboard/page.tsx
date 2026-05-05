'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import gsap from 'gsap'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { GripVertical, PlusCircle, Users, Receipt, ArrowRightLeft, LogOut } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

// Section components
import SkeletonLoader from '@/components/dashboard/SkeletonLoader'
import BalanceSummary from '@/components/dashboard/BalanceSummary'
import ExpenseCard from '@/components/dashboard/ExpenseCard'
import DebtTable, { EnrichedSettlement } from '@/components/dashboard/DebtTable'
import CreateBillModal from '@/components/dashboard/CreateBillModal'
import WalletDepositModal from '@/components/dashboard/WalletDepositModal'
import SettlementCelebration from '@/components/dashboard/SettlementCelebration'
import GroupCard from '@/components/groups/GroupCard'
import GroupDetailPanel from '@/components/groups/GroupDetailPanel'
import GroupLimitBar from '@/components/groups/GroupLimitBar'
import CreateGroupModal from '@/components/groups/CreateGroupModal'
import EmptyState from '@/components/ui/EmptyState'
import { useCountUp } from '@/hooks/useCountUp'
import { useToast } from '@/components/providers/ToastProvider'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ApiExpense {
  id: string; title: string; amount: number; createdAt: string; payerId: string
  payer: { id: string; name: string | null; image: string | null }
  splits: Array<{ userId: string; amount: number; user: { id: string; name: string | null } }>
}
interface ApiBalances {
  netBalances: Array<{ userId: string; amount: number }>
  settlements: EnrichedSettlement[]
}
interface ApiGroup {
  id: string; name: string; icon?: string | null; currency: string
  members: Array<{ userId: string; role: string; user: { id: string; name: string | null; image: string | null } }>
  _count?: { expenses: number }
}
interface SettleCelebrationData { amount: number; debtorName: string; debtorId: string; creditorId: string; groupId: string }

// ─── Section IDs (order = render order) ──────────────────────────────────────
type SectionId = 'balances' | 'groups' | 'expenses' | 'debts'

const SECTION_META: Record<SectionId, { label: string; icon: React.ReactNode }> = {
  balances: { label: 'Overview', icon: <ArrowRightLeft className="w-4 h-4" /> },
  groups: { label: 'Groups', icon: <Users className="w-4 h-4" /> },
  expenses: { label: 'Recent Expenses', icon: <Receipt className="w-4 h-4" /> },
  debts: { label: 'Settlements', icon: <ArrowRightLeft className="w-4 h-4" /> },
}

// ─── Section Grip Header ──────────────────────────────────────────────────────
function SectionHeader({
  id, label, icon, action, dragHandleProps
}: { id: SectionId; label: string; icon: React.ReactNode; action?: React.ReactNode; dragHandleProps?: any }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <button
        title="Drag to reorder"
        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
        {...dragHandleProps}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-muted-foreground">{icon}</span>
      <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex-1">{label}</h2>
      {action}
    </div>
  )
}

// ─── Sortable Wrapper ─────────────────────────────────────────────────────────
function SortableSection({ id, children }: { id: SectionId; children: (dragProps: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    position: 'relative' as const,
    boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined,
    scale: isDragging ? 1.02 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="dashboard-content-box">
      {children({ ...attributes, ...listeners })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const reduced = useReducedMotion()

  const [loading, setLoading] = useState(true)
  const [dataVisible, setDataVisible] = useState(false)
  const [showCreateBill, setShowCreateBill] = useState(false)
  const [showWalletDeposit, setShowWalletDeposit] = useState(false)
  const [showCreateGroup, setShowCreateGroup] = useState(false)
  const [celebration, setCelebration] = useState<SettleCelebrationData | null>(null)
  const [openGroupId, setOpenGroupId] = useState<string | null>(null)

  // API state
  const [groupId, setGroupId] = useState<string | null>(null) // primary group for expense modal
  const [groups, setGroups] = useState<ApiGroup[]>([])
  const [apiExpenses, setApiExpenses] = useState<ApiExpense[]>([])
  const [apiBalances, setApiBalances] = useState<ApiBalances | null>(null)
  const [newExpenseId, setNewExpenseId] = useState<string | null>(null)

  // Section order — grip reorder
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(['balances', 'groups', 'expenses', 'debts'])
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  // Computed balances
  const myNetBalance = apiBalances?.netBalances.find(b => b.userId === session?.user?.id)?.amount ?? 0
  const owedDisplay = Math.max(0, myNetBalance)
  const owingDisplay = Math.abs(Math.min(0, myNetBalance))
  const balanceRef = useCountUp(myNetBalance, { prefix: '₦', duration: 1.1 })

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const groupsRes = await fetch('/api/groups')
      if (!groupsRes.ok) return
      const fetchedGroups: ApiGroup[] = await groupsRes.json()
      setGroups(fetchedGroups)
      if (fetchedGroups.length === 0) return

      const gId = fetchedGroups[0].id
      setGroupId(gId)

      const [eRes, bRes] = await Promise.all([
        fetch(`/api/groups/${gId}/expenses`),
        fetch(`/api/groups/${gId}/balances`),
      ])
      if (eRes.ok) setApiExpenses(await eRes.json())
      if (bRes.ok) setApiBalances(await bRes.json())
    } catch { /* silently skip */ }
  }, [])

  useEffect(() => {
    if (session?.user) fetchAll()
  }, [session, fetchAll])

  // ─── Expense created callback ───────────────────────────────────────────────
  const handleExpenseCreated = useCallback((expense: ApiExpense) => {
    setApiExpenses(prev => [expense, ...prev])
    setNewExpenseId(expense.id)
    setTimeout(() => setNewExpenseId(null), 1500)
    if (groupId) {
      fetch(`/api/groups/${groupId}/balances`).then(r => r.json()).then(setApiBalances).catch(() => {})
    }
    addToast('Expense added!', 'success')
  }, [groupId, addToast])

  // ─── Settlement handler ─────────────────────────────────────────────────────
  const handleSettle = useCallback((debtorId: string, creditorId: string, amount: number, name: string) => {
    const gId = openGroupId ?? groupId
    if (!gId) return
    setCelebration({ debtorId, creditorId, amount, debtorName: name, groupId: gId })
  }, [openGroupId, groupId])

  const onSettlementComplete = useCallback(async () => {
    if (!celebration) return
    try {
      const res = await fetch(`/api/groups/${celebration.groupId}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          debtorId: celebration.debtorId,
          creditorId: celebration.creditorId,
          amount: celebration.amount,
        }),
      })
      if (res.ok) {
        addToast('Settlement recorded! 🎉', 'success')
        fetchAll()
      } else {
        addToast('Failed to record settlement', 'error')
      }
    } catch {
      addToast('Network error', 'error')
    }
    setCelebration(null)
  }, [celebration, addToast, fetchAll])

  // ─── Delete group ───────────────────────────────────────────────────────────
  const handleDeleteGroup = useCallback(async (gId: string) => {
    if (!confirm('Delete this group? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/groups/${gId}`, { method: 'DELETE' })
      if (res.ok) {
        addToast('Group deleted', 'info')
        setGroups(prev => prev.filter(g => g.id !== gId))
        if (openGroupId === gId) setOpenGroupId(null)
      } else {
        addToast('Failed to delete group', 'error')
      }
    } catch {
      addToast('Network error', 'error')
    }
  }, [addToast, openGroupId])

  // ─── Dnd-kit logic ──────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as SectionId)
        const newIndex = items.indexOf(over.id as SectionId)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  // ─── Expense card format ────────────────────────────────────────────────────
  const expenseCards = apiExpenses.slice(0, 5).map(e => ({
    id: e.id, title: e.title, amount: e.amount,
    payer: e.payer?.name || 'Unknown',
    splits: e.splits.map(s => ({ userName: s.user?.name || 'Unknown', amount: s.amount })),
    createdAt: new Date(e.createdAt).toLocaleDateString(),
  }))

  // ─── Render sections ────────────────────────────────────────────────────────
  const renderSection = (id: SectionId) => {
    switch (id) {
      case 'balances':
        return (
          <SortableSection key="balances" id="balances">
            {(dragProps) => (
              <>
                <SectionHeader id="balances" {...SECTION_META.balances} dragHandleProps={dragProps} />
                <BalanceSummary owed={owedDisplay} owing={owingDisplay} />
              </>
            )}
          </SortableSection>
        )

      case 'groups':
        return (
          <SortableSection key="groups" id="groups">
            {(dragProps) => (
              <>
                <SectionHeader
                  id="groups"
                  {...SECTION_META.groups}
                  dragHandleProps={dragProps}
                  action={
                    <button
                      onClick={() => setShowCreateGroup(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> New
                    </button>
                  }
                />
                <GroupLimitBar count={groups.length} onUpgrade={() => addToast('Pro plan coming soon!', 'info')} />
                <div className="space-y-2 mt-3">
                  {groups.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No groups yet"
                      description="Create a group to start splitting expenses."
                      action={{ label: 'Create Group', onClick: () => setShowCreateGroup(true) }}
                    />
                  ) : (
                    groups.map(g => {
                      const myBalance = apiBalances?.netBalances.find(b => b.userId === session?.user?.id)?.amount
                      const membership = g.members.find(m => m.userId === session?.user?.id)
                      return (
                        <div key={g.id}>
                          <GroupCard
                            group={g}
                            currentUserId={session?.user?.id}
                            netBalance={myBalance}
                            isAdmin={membership?.role === 'ADMIN'}
                            onOpen={gId => setOpenGroupId(prev => prev === gId ? null : gId)}
                            onDelete={handleDeleteGroup}
                          />
                          {openGroupId === g.id && (
                            <div className="mt-2 ml-2">
                              <GroupDetailPanel
                                groupId={g.id}
                                currentUserId={session?.user?.id}
                                onClose={() => setOpenGroupId(null)}
                                onSettle={(debtorId, creditorId, amount, name) =>
                                  handleSettle(debtorId, creditorId, amount, name)
                                }
                              />
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </>
            )}
          </SortableSection>
        )

      case 'expenses':
        return (
          <SortableSection key="expenses" id="expenses">
            {(dragProps) => (
              <>
                <SectionHeader
                  id="expenses"
                  {...SECTION_META.expenses}
                  dragHandleProps={dragProps}
                  action={
                    <button
                      onClick={() => setShowCreateBill(true)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add
                    </button>
                  }
                />
                {expenseCards.length === 0 ? (
                  <EmptyState
                    icon={Receipt}
                    title="No expenses yet"
                    description="Add your first expense to start tracking."
                    action={{ label: 'Add Expense', onClick: () => setShowCreateBill(true) }}
                  />
                ) : (
                  <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
                    {expenseCards.map(expense => (
                      <ExpenseCard key={expense.id} expense={expense} isNew={expense.id === newExpenseId} />
                    ))}
                  </div>
                )}
              </>
            )}
          </SortableSection>
        )

      case 'debts':
        return (
          <SortableSection key="debts" id="debts">
            {(dragProps) => (
              <>
                <SectionHeader id="debts" {...SECTION_META.debts} dragHandleProps={dragProps} />
                <DebtTable
                  currentUserId={session?.user?.id}
                  settlements={apiBalances?.settlements ?? []}
                  onSettle={(name, amount) => {
                    const s = apiBalances?.settlements.find(s =>
                      (s.from === session?.user?.id || s.to === session?.user?.id) &&
                      Math.abs(s.amount - amount) < 0.01
                    )
                    if (s) handleSettle(s.from, s.to, s.amount, name)
                  }}
                />
              </>
            )}
          </SortableSection>
        )
    }
  }

  return (
    <div className="dashboard-wrapper">
      {loading ? (
        <SkeletonLoader onComplete={() => { setLoading(false); setDataVisible(true) }} />
      ) : (
        <div ref={containerRef} className={`dashboard-container transition-opacity duration-500 ${dataVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Header */}
          <div className="dashboard-header">
            <div className="flex flex-col">
              <span className="dashboard-header-title">Net Balance</span>
              <span
                ref={balanceRef}
                className={`dashboard-header-balance ${myNetBalance >= 0 ? '' : 'text-rose-500'}`}
              >
                ₦0
              </span>
            </div>
            <div className="dashboard-header-actions">
              <button
                onClick={() => setShowCreateBill(true)}
                className="dashboard-action-btn hover:cursor-pointer"
                title="Add expense"
              >
                <PlusCircle className="w-6 h-6 md:w-8 md:h-8 text-foreground inline-block" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => { /* sign out handled elsewhere */ }}
                className="dashboard-action-btn hover:cursor-pointer"
                title="Account"
              >
                {session?.user?.image ? (
                  <img src={session.user.image} alt="avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <LogOut className="w-6 h-6 text-foreground inline-block" strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Vertical sections — DndKit reorderable */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-4">
              <SortableContext
                items={sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {sectionOrder.map(id => renderSection(id))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      )}

      {/* Modals */}
      {showCreateBill && (
        <CreateBillModal
          groupId={groupId}
          onClose={() => setShowCreateBill(false)}
          onExpenseCreated={handleExpenseCreated}
        />
      )}
      {showWalletDeposit && (
        <WalletDepositModal onClose={() => setShowWalletDeposit(false)} />
      )}
      {showCreateGroup && (
        <CreateGroupModal
          groupCount={groups.length}
          onClose={() => setShowCreateGroup(false)}
          onCreated={g => {
            setGroups(prev => [g, ...prev])
            if (!groupId) setGroupId(g.id)
          }}
        />
      )}

      {/* Settlement Celebration */}
      {celebration && (
        <SettlementCelebration
          amount={celebration.amount}
          debtorName={celebration.debtorName}
          onComplete={onSettlementComplete}
        />
      )}
    </div>
  )
}
