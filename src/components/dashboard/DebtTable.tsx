'use client';

import React, { useEffect, useState } from 'react';
import { Filter, ChevronLeft, ChevronRight, MoreHorizontal, UserCircle2, MousePointerClick } from 'lucide-react';
import gsap from 'gsap';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import BillDetailsModal, { BillDetails } from './BillDetailsModal';

export default function DebtTable() {
  const mockData = useSelector((state: RootState) => state.dashboard.bills);
  const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null);

  const handleNudge = (id: string) => {
    // Emotional Design: GSAP Bounce Animation (Row Container)
    const target = `.row-${id}`;
    gsap.timeline()
      .to(target, { y: -6, scale: 1.02, duration: 0.15, ease: 'power1.in' })
      .to(target, { y: 0, scale: 1, duration: 0.4, ease: 'bounce.out' });
  };

  useEffect(() => {
    const owedDebts = mockData.filter(item => item.amount < 0 && item.status !== 'Paid');
    if (owedDebts.length === 0) return;

    const interval = setInterval(() => {
      // Randomly select one owed debt to simulate incoming nudge
      const randomDebt = owedDebts[Math.floor(Math.random() * owedDebts.length)];
      const target = `.row-${randomDebt.id}`;
      
      gsap.timeline()
        .to(target, { y: -6, scale: 1.02, duration: 0.15, ease: 'power1.in' })
        .to(target, { y: 0, scale: 1, duration: 0.4, ease: 'bounce.out' });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
          <span>1 of 30</span>
          <button className="dash-table-pagination-btn">
            <ChevronRight className="w-5 h-5 inline-block hover:cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="dash-table-scroll-container">
        <div className="dash-table-inner">
          {mockData.map((item) => (
            <div 
              key={item.id} 
              className={`dash-table-row group row-${item.id} cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all`}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.nudge-btn') || target.closest('.options-btn')) {
                  return;
                }
                setSelectedBill(item);
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
                <span className={`amount-text-${item.id} inline-block ${item.amount > 0 ? 'text-accent' : ''}`}>
                  {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
                </span>
              </div>

              {/* Nudge Icon */}
              <div className="dash-cell-nudge">
                 {item.amount > 0 && item.status !== 'Paid' && (
                   <button 
                     title="Nudge user" 
                     className="nudge-btn cursor-pointer"
                     onClick={() => handleNudge(item.id)}
                   >
                     <MousePointerClick className="w-6 h-6 inline-block" strokeWidth={1.5} />
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
