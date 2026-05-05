'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import gsap from 'gsap';
import { useDispatch } from 'react-redux';
import { addBill } from '@/store/dashboardSlice';

interface Props {
  groupId?: string | null;
  onClose: () => void;
  onExpenseCreated?: (expense: any) => void;
}

export default function CreateBillModal({ groupId, onClose, onExpenseCreated }: Props) {
  const [members, setMembers] = useState<Array<{ user: { id: string, name: string | null } }>>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'owed' | 'owe'>('owed');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetch(`/api/groups/${groupId}/members`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setMembers(data);
        })
        .catch(console.error);
    }

    if (overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    }
  }, [groupId]);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in', onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const numAmount = parseInt(amount, 10);
    if (!selectedUserId || !purpose || isNaN(numAmount)) return;

    setSubmitting(true);

    if (groupId) {
      try {
        const res = await fetch(`/api/groups/${groupId}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: purpose,
            amount: numAmount,
            splits: [
              { userId: selectedUserId, amount: numAmount },
            ],
          }),
        });

        if (res.ok) {
          const expense = await res.json();
          onExpenseCreated?.(expense);
          handleClose();
          return;
        } else {
          const data = await res.json();
          setError(data.error || 'Failed to create expense');
        }
      } catch (e) {
        setError('Network error occurred');
      }
    }
    setSubmitting(false);
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-lg bg-background rounded-[2rem] shadow-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5" /> New Bill
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
          {error && <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl text-sm font-medium">{error}</div>}
          
          <div className="flex p-1 bg-muted/50 rounded-xl">
            <button
              type="button"
              onClick={() => setType('owed')}
              className={`flex-1 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${type === 'owed' ? 'bg-background shadow-sm text-emerald-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              They owe you
            </button>
            <button
              type="button"
              onClick={() => setType('owe')}
              className={`flex-1 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer ${type === 'owe' ? 'bg-background shadow-sm text-rose-600' : 'text-muted-foreground hover:text-foreground'}`}
            >
              You owe them
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Group Member</label>
              <select required value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full p-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none">
                <option value="" disabled>Select member...</option>
                {members.map(m => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name || 'Unknown'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Purpose</label>
              <input required value={purpose} onChange={e => setPurpose(e.target.value)} type="text" className="w-full p-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="e.g. Netflix Subscription" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Amount (₦)</label>
              <input required value={amount} onChange={e => setAmount(e.target.value)} type="number" min="1" className="w-full p-3 text-xl font-bold bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="0" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-4 py-4 bg-foreground text-background font-bold rounded-xl transition-all cursor-pointer hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Bill'}
          </button>
        </form>
      </div>
    </div>
  );
}
