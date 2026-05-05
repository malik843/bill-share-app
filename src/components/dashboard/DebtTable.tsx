'use client';

import React, { useState } from 'react';
import { Filter, ChevronLeft, ChevronRight, MoreHorizontal, UserCircle2, MousePointerClick, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import BillDetailsModal, { BillDetails } from './BillDetailsModal';
import { useShakeOnOverdue } from '@/hooks/useShakeOnOverdue';

// Wrapper that applies the shake to individual rows
function DebtRow({
  item,
  onNudge,
  onSelect,
  onSettle,
}: {
  item: BillDetails;
  onNudge: (id: string) => void;
  onSelect: (bill: BillDetails) => void;
  onSettle?: (name: string, amount: number) => void;
}) {
  const isOverdue = item.amount < 0 && item.status !== 'Paid';
  const shakeRef = useShakeOnOverdue(isOverdue);

  return (
    <div
      ref={shakeRef}
      className={`dash-table-row group row-${item.id} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all`}
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest('.nudge-btn') || target.closest('.options-btn') || target.closest('.settle-btn')) {
          return;
        }
        onSelect(item);
      }}
    >
      {/* User Avatar & Name */}
      <div className="dash-cell-user">
        <UserCircle2 className="w-10 h-10 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0 inline-block" strokeWidth={1.5} />
        <span className="dash-cell-user-name">{item.name}</span>
      </div>

      {/* Purpose */}
      <div className="dash-cell-purpose">
        {item.purpose}
      </div>

      {/* Amount */}
      <div className="dash-cell-amount">
        <span className={`inline-block ${item.amount > 0 ? 'text-accent' : ''}`}>
          {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
        </span>
      </div>

      {/* Nudge / Settle */}
      <div className="dash-cell-nudge">
        {item.amount > 0 && item.status !== 'Paid' && (
          <button
            title="Nudge user"
            className="nudge-btn cursor-pointer"
            onClick={() => onNudge(item.id)}
          >
            <MousePointerClick className="w-6 h-6 inline-block" strokeWidth={1.5} />
          </button>
        )}
        {item.amount < 0 && item.status !== 'Paid' && onSettle && (
          <button
            title="Settle this debt"
            className="settle-btn text-emerald-500 hover:text-emerald-400 transition-colors cursor-pointer"
            onClick={() => onSettle(item.name, Math.abs(item.amount))}
          >
            <CheckCircle className="w-6 h-6 inline-block" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Status */}
      <div className="dash-cell-status">
        <span className={`status-badge ${item.status === 'Paid' ? 'status-badge-paid' : 'status-badge-pending'}`}>
          {item.status}
        </span>
      </div>

      {/* Ellipsis Options */}
      <div className="dash-cell-options">
        <button className="options-btn">
          <MoreHorizontal className="w-6 h-6 inline-block hover:cursor-pointer" />
        </button>
      </div>
    </div>
  );
}

export interface EnrichedSettlement {
  from: string;
  to: string;
  amount: number;
  fromUser: { id: string; name: string | null; image: string | null; avatar: string | null; email: string };
  toUser: { id: string; name: string | null; image: string | null; avatar: string | null; email: string };
}

interface DebtTableProps {
  currentUserId?: string;
  settlements: EnrichedSettlement[];
  onSettle?: (name: string, amount: number) => void;
}

export default function DebtTable({ currentUserId, settlements, onSettle }: DebtTableProps) {
  const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null);

  const handleNudge = (id: string) => {
    const target = `.row-${id}`;
    gsap.timeline()
      .to(target, { y: -6, scale: 1.02, duration: 0.15, ease: 'power1.in' })
      .to(target, { y: 0, scale: 1, duration: 0.4, ease: 'bounce.out' });
  };

  // Only show settlements involving the current user
  const relevantSettlements = settlements.filter(s => s.from === currentUserId || s.to === currentUserId);

  const tableData: BillDetails[] = relevantSettlements.map((s, index) => {
    const isOwedToMe = s.to === currentUserId;
    const otherUser = isOwedToMe ? s.fromUser : s.toUser;
    
    return {
      id: `settlement-${index}`,
      name: otherUser.name || 'Unknown',
      purpose: 'Aggregated Debt', // Since it's calculated from multiple expenses
      amount: isOwedToMe ? s.amount : -s.amount,
      status: 'Pending'
    };
  });

  if (tableData.length === 0) {
    return (
      <div className="dash-table-wrapper p-8 text-center text-muted-foreground border-dashed border-2 border-border/50">
        No active debts or settlements. Add an expense to get started!
      </div>
    );
  }

  return (
    <div className="dash-table-wrapper">
      {/* Table Header Controls */}
      <div className="dash-table-controls">
        <button className="dash-table-filter-btn" title="Filter Records">
          <Filter className="w-5 h-5 mx-auto inline-block" />
        </button>
        <div className="dash-table-pagination">
          <button className="dash-table-pagination-btn">
            <ChevronLeft className="w-5 h-5 inline-block hover:cursor-pointer" />
          </button>
          <span>1 of {Math.ceil(tableData.length / 5) || 1}</span>
          <button className="dash-table-pagination-btn">
            <ChevronRight className="w-5 h-5 inline-block hover:cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="dash-table-scroll-container">
        <div className="dash-table-inner">
          {tableData.map((item) => (
            <DebtRow
              key={item.id}
              item={item}
              onNudge={handleNudge}
              onSelect={setSelectedBill}
              onSettle={onSettle}
            />
          ))}
        </div>
      </div>

      {selectedBill && (
        <BillDetailsModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}
    </div>
  );
}
