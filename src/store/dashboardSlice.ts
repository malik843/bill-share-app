import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BillDetails {
  id: string;
  name: string;
  purpose: string;
  amount: number;
  status: string;
}

interface DashboardState {
  bills: BillDetails[];
  walletBalance: number;
}

const initialState: DashboardState = {
  walletBalance: 15000,
  bills: [
    { id: '1', name: 'Chinedu O.', purpose: 'Dinner at RSV', amount: 15000, status: 'Pending' },
    { id: '2', name: 'Aisha M.', purpose: 'Uber ride', amount: -5000, status: 'Paid' },
    { id: '3', name: 'Seun A.', purpose: 'Concert Tickets', amount: -10000, status: 'Pending' },
    { id: '4', name: 'Kemi L.', purpose: 'Groceries', amount: 3500, status: 'Pending' },
    { id: '5', name: 'Tobi F.', purpose: 'Weekend Trip', amount: 25000, status: 'Pending' },
  ],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addBill: (state, action: PayloadAction<BillDetails>) => {
      state.bills.unshift(action.payload);
    },
    deposit: (state, action: PayloadAction<number>) => {
      state.walletBalance += action.payload;
    },
    updateBillStatus: (state, action: PayloadAction<{ id: string; status: string }>) => {
      const bill = state.bills.find(b => b.id === action.payload.id);
      if (bill) {
        bill.status = action.payload.status;
      }
    }
  },
});

export const { addBill, deposit, updateBillStatus } = dashboardSlice.actions;
export default dashboardSlice.reducer;
