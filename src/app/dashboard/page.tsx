'use client';

import React, { useState } from 'react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import SettleUpButton from '@/components/dashboard/SettleUpButton';
import RelationshipGraph from '@/components/dashboard/RelationshipGraph';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dataVisible, setDataVisible] = useState(false);

  // Mock data representing simplified debts
  const mockNodes = [
    { id: '1', name: 'Chinedu', amount: 15000 },
    { id: '2', name: 'Aisha', amount: -5000 },
    { id: '3', name: 'Seun', amount: -10000 },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/10 via-background to-background">
      {loading ? (
        <SkeletonLoader onComplete={() => { setLoading(false); setDataVisible(true); }} />
      ) : (
        <div 
          className={`w-full max-w-4xl mx-auto space-y-8 p-6 pt-12 transition-opacity duration-700 ease-out ${dataVisible ? 'opacity-100' : 'opacity-0'}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="h-10 w-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold relative group cursor-pointer">
              C
              <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto h-0 group-hover:h-auto overflow-hidden">
                <div className="p-2 border-b border-border text-sm font-medium">Chinedu O.</div>
                <button className="w-full text-left p-2 text-sm text-destructive hover:bg-muted transition-colors">Log out</button>
              </div>
            </div>
          </div>

          {/* Abstract Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center">
              <span className="text-muted-foreground text-sm font-medium">Total Balance</span>
              <span className="text-4xl font-bold text-accent mt-2">+₦15,000</span>
            </div>
            
            <div className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-center items-start">
              <span className="text-muted-foreground text-sm font-medium mb-4">Quick Actions</span>
              <SettleUpButton onClick={() => alert('Settle Up modal would open here')} />
            </div>
          </div>

          {/* The Relationship Graph */}
          <RelationshipGraph nodes={mockNodes} />
        </div>
      )}
    </div>
  );
}
