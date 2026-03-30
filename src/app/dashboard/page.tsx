'use client';

import React, { useState } from 'react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import DebtTable from '@/components/dashboard/DebtTable';
import { PlusCircle, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dataVisible, setDataVisible] = useState(false);

  return (
    <div className="min-h-screen bg-muted/30 text-foreground flex flex-col items-center">
      {loading ? (
        <SkeletonLoader onComplete={() => { setLoading(false); setDataVisible(true); }} />
      ) : (
        <div 
          className={`w-full max-w-7xl mx-auto flex-1 flex flex-col p-4 sm:p-6 lg:p-10 transition-opacity duration-700 ease-out ${dataVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Top Section */}
          <div className="flex justify-between items-center w-full mb-8 bg-card p-6 md:p-8 rounded-[2rem] shadow-sm border border-border">
             <div className="flex flex-col">
               <span className="text-muted-foreground text-sm font-semibold uppercase tracking-widest mb-1">Total balance</span>
               <span className="text-4xl md:text-5xl font-bold tracking-tight">₦15,000</span>
             </div>
             <div className="flex space-x-3 md:space-x-6 items-center">
                <button className="p-3 md:p-4 bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm">
                  <PlusCircle className="w-6 h-6 md:w-8 md:h-8 text-foreground" strokeWidth={1.5} />
                </button>
                <button className="p-3 md:p-4 bg-muted hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm">
                  <Wallet className="w-6 h-6 md:w-8 md:h-8 text-foreground" strokeWidth={1.5} />
                </button>
             </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 w-full bg-card rounded-[2rem] p-6 md:p-8 shadow-sm border border-border flex flex-col">
            <DebtTable />
          </div>
        </div>
      )}
    </div>
  );
}
