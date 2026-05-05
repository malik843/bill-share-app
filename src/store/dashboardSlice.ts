import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BillDetails {
  id: string;
  name: string;
  purpose: string;
  amount: number;
  status: string;
}

export interface UserProfile {
  displayName: string;
  avatarId: string;
  phoneNumber: string | null;
  currency: "NGN" | "USD" | "EUR" | "GBP" | "CAD" | "GHS";
  paymentMethod: "bank_transfer" | "mobile_money" | "card" | "paypal" | "in_app_wallet" | null;
  firstGroup: {
    name: string;
    icon: string;
    members: string[];
  };
}

interface DashboardState {
  bills: BillDetails[];
  walletBalance: number;
  user: UserProfile | null;
}

const initialState: DashboardState = {
  walletBalance: 15000,
  user: null,
  bills: [],
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
    },
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.user = action.payload;
    }
  },
});

export const { addBill, deposit, updateBillStatus, setUserProfile } = dashboardSlice.actions;
export default dashboardSlice.reducer;
