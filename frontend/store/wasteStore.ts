import { create } from 'zustand';
import api from '@/lib/api';

export interface WasteLog {
  id: string;
  productId: string;
  vendorId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'excess' | 'other';
  wasteDate: string;
  notes?: string;
  costImpact: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    category: string;
    costPrice: number;
  };
}

export interface WasteStats {
  summary: {
    totalWaste: number;
    totalCostImpact: number;
    totalQuantity: number;
  };
  wasteByReason: {
    expired: number;
    damaged: number;
    excess: number;
    other: number;
  };
  wasteByCategory: {
    [key: string]: number;
  };
  topWastedProducts: Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalCostImpact: number;
    wasteCount: number;
  }>;
}

export interface LogWasteData {
  productId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'excess' | 'other';
  wasteDate: string;
  notes?: string;
}

export interface WasteLogsFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  reason?: 'expired' | 'damaged' | 'excess' | 'other';
  limit?: number;
  offset?: number;
}

interface WasteStore {
  wasteLogs: WasteLog[];
  stats: WasteStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  logWaste: (data: LogWasteData) => Promise<void>;
  getWasteLogs: (filters?: WasteLogsFilters) => Promise<void>;
  getWasteStats: (startDate?: string, endDate?: string) => Promise<void>;
  getWasteByProduct: (productId: string) => Promise<WasteLog[]>;
  deleteWasteLog: (id: string) => Promise<void>;
  clearError: () => void;
}

const useWasteStore = create<WasteStore>((set, get) => ({
  wasteLogs: [],
  stats: null,
  loading: false,
  error: null,

  logWaste: async (data: LogWasteData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/waste', data);
      const newLog = response.data.data || response.data;
      
      // Add the new log to the list
      set((state) => ({
        wasteLogs: [newLog, ...state.wasteLogs],
        loading: false
      }));
      
      // Refresh stats if available
      if (get().stats) {
        await get().getWasteStats();
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to log waste',
        loading: false
      });
      throw error;
    }
  },

  getWasteLogs: async (filters?: WasteLogsFilters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.productId) params.append('productId', filters.productId);
      if (filters?.reason) params.append('reason', filters.reason);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await api.get(`/waste?${params.toString()}`);
      const logs = response.data.data || response.data;
      
      set({
        wasteLogs: Array.isArray(logs) ? logs : [],
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch waste logs',
        loading: false
      });
      throw error;
    }
  },

  getWasteStats: async (startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/waste/stats?${params.toString()}`);
      const stats = response.data.data || response.data;
      
      set({
        stats: stats,
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch waste statistics',
        loading: false
      });
      throw error;
    }
  },

  getWasteByProduct: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/waste/product/${productId}`);
      const data = response.data.data || response.data;
      
      set({ loading: false });
      return data.wasteLogs || [];
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product waste history',
        loading: false
      });
      throw error;
    }
  },

  deleteWasteLog: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/waste/${id}`);
      
      // Remove the log from the list
      set((state) => ({
        wasteLogs: state.wasteLogs.filter((log) => log.id !== id),
        loading: false
      }));
      
      // Refresh stats if available
      if (get().stats) {
        await get().getWasteStats();
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete waste log',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useWasteStore;
