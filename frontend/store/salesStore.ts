import { create } from 'zustand';
import api from '@/lib/api';

export interface Sale {
  id: string;
  vendorId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  soldAt: string;
  product?: {
    id: string;
    name: string;
    category: string;
    unit: string;
  };
}

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  error: string | null;
  fetchSales: (filters?: { startDate?: string; endDate?: string; productId?: string }) => Promise<void>;
  createSale: (data: { productId: string; quantity: number; unitPrice: number; soldAt?: string }) => Promise<Sale>;
  clearError: () => void;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  error: null,

  fetchSales: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.productId) params.append('productId', filters.productId);

      const response = await api.get(`/api/v1/sales?${params.toString()}`);
      set({ sales: response.sales, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sales';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  createSale: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/v1/sales', data);
      const sale: Sale = response.sale;
      set((state) => ({ sales: [sale, ...state.sales], isLoading: false }));
      return sale;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to record sale';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));