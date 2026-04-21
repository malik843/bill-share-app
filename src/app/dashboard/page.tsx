'use client';

import React, { useState } from 'react';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import DebtTable from '@/components/dashboard/DebtTable';
import { PlusCircle, Wallet } from 'lucide-react';
import CreateBillModal from '@/components/dashboard/CreateBillModal';
import WalletDepositModal from '@/components/dashboard/WalletDepositModal';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dataVisible, setDataVisible] = useState(false);
  const [showCreateBill, setShowCreateBill] = useState(false);
  const [showWalletDeposit, setShowWalletDeposit] = useState(false);
  
  const walletBalance = useSelector((state: RootState) => state.dashboard.walletBalance);

  return (
    <div className="dashboard-wrapper">
      {loading ? (
        <SkeletonLoader onComplete={() => { setLoading(false); setDataVisible(true); }} />
      ) : (
        <div className={`dashboard-container ${dataVisible ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Section */}
          <div className="dashboard-header">
             <div className="flex flex-col">
               <span className="dashboard-header-title">Total balance</span>
               <span className="dashboard-header-balance">₦{walletBalance.toLocaleString()}</span>
             </div>
             <div className="dashboard-header-actions">
                <button 
                  onClick={() => setShowCreateBill(true)}
                  className="dashboard-action-btn hover:cursor-pointer"
                >
                  <PlusCircle className="w-6 h-6 md:w-8 md:h-8 text-foreground inline-block " strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setShowWalletDeposit(true)}
                  className="dashboard-action-btn hover:cursor-pointer"
                >
                  <Wallet className="w-6 h-6 md:w-8 md:h-8 text-foreground inline-block" strokeWidth={1.5} />
                </button>
             </div>
          </div>

          {/* Table Section */}
          <div className="dashboard-content-box">
            <div className="dashboard-content-inner">
              <DebtTable />
            </div>
          </div>
        </div>
      )}

      {showCreateBill && <CreateBillModal onClose={() => setShowCreateBill(false)} />}
      {showWalletDeposit && <WalletDepositModal onClose={() => setShowWalletDeposit(false)} />}
    </div>
  );
}
