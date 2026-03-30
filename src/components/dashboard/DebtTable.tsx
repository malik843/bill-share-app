'use client';

import React from 'react';
import { Filter, ChevronLeft, ChevronRight, MoreHorizontal, UserCircle2, MousePointerClick } from 'lucide-react';

const mockData = [
  { id: '1', name: 'Chinedu O.', purpose: 'Dinner at RSV', amount: 15000, status: 'Pending' },
  { id: '2', name: 'Aisha M.', purpose: 'Uber ride', amount: -5000, status: 'Paid' },
  { id: '3', name: 'Seun A.', purpose: 'Concert Tickets', amount: -10000, status: 'Pending' },
  { id: '4', name: 'Kemi L.', purpose: 'Groceries', amount: 3500, status: 'Pending' },
  { id: '5', name: 'Tobi F.', purpose: 'Weekend Trip', amount: 25000, status: 'Pending' },
];

export default function DebtTable() {
  return (
    <div className="w-full flex-1 flex flex-col">
      {/* Table Header Controls */}
      <div className="flex justify-end items-center mb-6 space-x-6 text-muted-foreground selection:bg-transparent">
        <button className="hover:text-foreground transition-colors p-1" title="Filter Records">
          <Filter className="w-5 h-5 mx-auto" />
        </button>
        <div className="flex items-center space-x-4 text-sm font-medium">
          <button className="hover:text-foreground transition-colors border border-border hover:bg-muted rounded-md p-1 items-center justify-center flex">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span>1 of 30</span>
          <button className="hover:text-foreground transition-colors border border-border hover:bg-muted rounded-md p-1 items-center justify-center flex">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table List */}
      <div className="flex flex-col space-y-3 w-full overflow-x-auto pb-4">
        <div className="min-w-[700px] flex flex-col space-y-3">
          {mockData.map((item) => (
            <div 
              key={item.id} 
              className="group flex items-center w-full p-4 md:px-6 md:py-5 bg-card/60 hover:bg-muted/60 transition-colors rounded-2xl border border-border shadow-sm"
            >
              {/* User Avatar & Name */}
              <div className="flex items-center space-x-4 w-2/12">
                <UserCircle2 className="w-10 h-10 text-slate-400 group-hover:text-primary transition-colors flex-shrink-0" strokeWidth={1.5} />
                <span className="font-semibold text-foreground truncate">{item.name}</span>
              </div>
              
              {/* Purpose */}
              <div className="w-3/12 text-sm text-foreground/80 font-medium truncate px-4">
                {item.purpose}
              </div>

              {/* Amount */}
              <div className="w-2/12 text-sm font-bold text-foreground truncate px-4">
                <span className={item.amount > 0 ? 'text-accent' : ''}>
                  {item.amount > 0 ? '+' : ''}₦{Math.abs(item.amount).toLocaleString()}
                </span>
              </div>

              {/* Nudge Icon */}
              <div className="w-2/12 flex justify-center px-4">
                 {item.amount > 0 && item.status !== 'Paid' && (
                   <button 
                     title="Nudge user" 
                     className="text-slate-400 hover:text-accent transition-transform hover:scale-110 active:scale-95"
                   >
                     <MousePointerClick className="w-6 h-6" strokeWidth={1.5} />
                   </button>
                 )}
              </div>

              {/* Status */}
              <div className="w-2/12 text-sm font-medium flex items-center justify-center px-4">
                <span className={`px-4 py-1.5 rounded-full text-xs tracking-wider uppercase font-bold w-full text-center ${
                  item.status === 'Paid' ? 'bg-accent/15 text-accent' : 'bg-destructive/15 text-destructive'
                }`}>
                  {item.status}
                </span>
              </div>

              {/* Ellipsis Options */}
              <div className="w-1/12 flex justify-end">
                 <button className="text-slate-400 hover:text-foreground transition-colors p-2 rounded-full hover:bg-background">
                   <MoreHorizontal className="w-6 h-6" />
                 </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
