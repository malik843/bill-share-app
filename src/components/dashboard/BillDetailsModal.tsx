'use client';

import React, { useEffect, useRef } from 'react';
import { X, Calendar, Wallet, CheckCircle2, AlertCircle } from 'lucide-react';
import gsap from 'gsap';

export interface BillDetails {
  id: string;
  name: string;
  purpose: string;
  amount: number;
  status: string;
}

interface Props {
  bill: BillDetails;
  onClose: () => void;
}

export default function BillDetailsModal({ bill, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current && modalRef.current) {
      gsap.fromTo(overlayRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      gsap.fromTo(modalRef.current, 
        { y: 40, opacity: 0, scale: 0.95 }, 
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, []);

  const handleClose = () => {
    if (overlayRef.current && modalRef.current) {
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
      gsap.to(modalRef.current, { 
        y: 20, 
        opacity: 0, 
        scale: 0.95, 
        duration: 0.2, 
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const isOwedToYou = bill.amount > 0;
  const absAmount = Math.abs(bill.amount).toLocaleString();

  // Close when clicking outside
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  };

  return (
    <div 
      ref={overlayRef} 
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div 
        ref={modalRef} 
        className="w-full max-w-lg bg-background rounded-[2.5rem] shadow-2xl border border-border overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground tracking-tight">Invoice Details</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl font-bold text-foreground">
                {bill.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-foreground">{bill.name}</h3>
                <p className="text-sm text-muted-foreground">{isOwedToYou ? 'Owes you' : 'You owe'}</p>
              </div>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 uppercase tracking-wider ${
              bill.status === 'Paid' ? 'bg-emerald-500/15 text-emerald-600' : 'bg-rose-500/15 text-rose-600'
            }`}>
              {bill.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2.5} /> : <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />}
              <span>{bill.status}</span>
            </div>
          </div>

          <div className="bg-muted/30 rounded-2xl p-6 space-y-4 border border-border">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide">Purpose</p>
              <p className="font-medium text-foreground text-lg">{bill.purpose}</p>
            </div>
            
            <div className="flex justify-between items-end pt-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wide">Amount</p>
                <p className={`text-3xl font-black tracking-tight ${isOwedToYou ? 'text-emerald-600' : 'text-foreground'}`}>
                  ₦{absAmount}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground mb-1 flex items-center justify-end uppercase tracking-wide">
                  <Calendar className="w-4 h-4 mr-1" />
                  Date
                </p>
                <p className="font-medium text-foreground">Oct 24, 2023</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-0 flex space-x-3">
          <button 
            className="flex-1 py-3.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-2xl transition-colors cursor-pointer"
            onClick={handleClose}
          >
            Close
          </button>
          {bill.status !== 'Paid' && (
            <button className={`flex-1 py-3.5 px-4 font-semibold rounded-2xl transition-colors flex items-center justify-center space-x-2 cursor-pointer ${
              isOwedToYou 
                ? 'bg-foreground text-background hover:opacity-90' 
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-600/20'
            }`}>
              <Wallet className="w-5 h-5" />
              <span>{isOwedToYou ? 'Send Reminder' : 'Pay Now'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
