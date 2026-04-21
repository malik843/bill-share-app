'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Wallet } from 'lucide-react';
import gsap from 'gsap';
import { useDispatch } from 'react-redux';
import { deposit } from '@/store/dashboardSlice';

interface Props {
  onClose: () => void;
}

export default function WalletDepositModal({ onClose }: Props) {
  const [amount, setAmount] = useState<string>('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.fromTo(modalRef.current, { y: 40, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    }
  }, []);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, { y: 20, opacity: 0, scale: 0.95, duration: 0.2, ease: 'power2.in', onComplete: onClose });
    } else {
      onClose();
    }
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/,/g, ''), 10);
    if (!isNaN(numAmount) && numAmount > 0) {
      dispatch(deposit(numAmount));
      handleClose();
    }
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div ref={modalRef} className="w-full max-w-md bg-background rounded-[2rem] shadow-2xl border border-border overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Deposit Funds
          </h2>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleDeposit} className="p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">Amount (₦)</label>
            <input 
              type="number" 
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full text-2xl font-bold p-4 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="e.g. 5000"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={!amount || parseInt(amount) <= 0}
            className="w-full py-4 bg-foreground text-background font-bold rounded-xl disabled:opacity-50 transition-all cursor-pointer hover:opacity-90"
          >
            Confirm Deposit
          </button>
        </form>
      </div>
    </div>
  );
}
