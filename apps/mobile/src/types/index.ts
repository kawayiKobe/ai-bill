export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type BillType = 'income' | 'expense';

export interface Bill {
  id: string;
  amount: number;
  type: BillType;
  categoryId: string;
  note?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: 'synced' | 'pending';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: BillType;
  isPreset: boolean;
}

export interface MonthlyStats {
  totalExpense: number;
  totalIncome: number;
  balance: number;
  byCategory: { categoryId: string; categoryName: string; amount: number }[];
}
