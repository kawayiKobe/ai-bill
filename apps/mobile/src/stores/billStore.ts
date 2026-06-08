import { create } from 'zustand';
import type { Bill, MonthlyStats, BillType, Category } from '../types';
import { apiClient } from '../services/apiClient';

interface BillFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: BillType;
}

interface BillState {
  bills: Bill[];
  categories: Category[];
  filters: BillFilters;
  monthlyStats: MonthlyStats | null;
  isLoading: boolean;
  total: number;
}

interface BillActions {
  fetchBills: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchStats: (year?: number, month?: number) => Promise<void>;
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Bill>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  setFilters: (filters: BillFilters) => void;
}

export const useBillStore = create<BillState & BillActions>((set, get) => ({
  bills: [],
  categories: [],
  filters: {},
  monthlyStats: null,
  isLoading: false,
  total: 0,

  fetchBills: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);
      if (filters.categoryId) params.set('categoryId', filters.categoryId);
      if (filters.type) params.set('type', filters.type);

      const queryStr = params.toString();
      const url = `/bills${queryStr ? `?${queryStr}` : ''}`;
      const data = await apiClient.get<{ bills: Bill[]; total: number }>(url);
      set({ bills: data.bills, total: data.total, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCategories: async () => {
    try {
      const data = await apiClient.get<Category[]>('/categories');
      set({ categories: data });
    } catch {
      // silently fail
    }
  },

  fetchStats: async (year?: number, month?: number) => {
    try {
      const now = new Date();
      const y = year || now.getFullYear();
      const m = month || now.getMonth() + 1;
      const data = await apiClient.get<MonthlyStats>(`/bills/stats?year=${y}&month=${m}`);
      set({ monthlyStats: data });
    } catch {
      // silently fail
    }
  },

  addBill: async (bill) => {
    set({ isLoading: true });
    try {
      await apiClient.post('/bills', bill);
      await get().fetchBills();
      await get().fetchStats();
    } finally {
      set({ isLoading: false });
    }
  },

  updateBill: async (id, updates) => {
    set({ isLoading: true });
    try {
      await apiClient.put(`/bills/${id}`, updates);
      await get().fetchBills();
      await get().fetchStats();
    } finally {
      set({ isLoading: false });
    }
  },

  deleteBill: async (id) => {
    set({ isLoading: true });
    try {
      await apiClient.delete(`/bills/${id}`);
      await get().fetchBills();
      await get().fetchStats();
    } finally {
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ filters });
    get().fetchBills();
  },
}));
