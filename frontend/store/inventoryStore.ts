import { create } from 'zustand';
import api from '@/lib/api';

export interface InventoryAdjustment {
  id: string;
  productId: string;
  vendorId: string;
  type: 'add' | 'remove' | 'correction';
  quantity: number;
  reason: string;
  notes?: string;
  product?: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface LowStockSummary {
  lowStockCount: number;
  lowStockProducts: Array<{ id: string; name: string; quantity: number; unit: string; expiryDate?: string }>;
  expiringCount: number;
  expiringProducts: Array<{ id: string; name: string; quantity: number; unit: string; expiryDate?: string }>;
}

interface InventoryState {
  adjustments: InventoryAdjustment[];
  lowStockSummary: LowStockSummary | null;
  isLoading: boolean;
  error: string | null;
  
  fetchAdjustments: (productId?: string) => Promise<void>;
  createAdjustment: (data: { productId: string; type: 'add' | 'remove' | 'correction'; quantity: number; reason: string; notes?: string }) => Promise<InventoryAdjustment>;
  getLowStockSummary: (threshold?: number) => Promise<void>;
  clearError: () => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  adjustments: [],
  lowStockSummary: null,
  isLoading: false,
  error: null,

  fetchAdjustments: async (productId) => {
    try {
      set({ isLoading: true, error: null });
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);

      const response = await api.get(`/api/v1/inventory/adjustments?${params.toString()}`);
      set({ adjustments: response.adjustments, isLoading: false });
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Failed to fetch adjustments';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  createAdjustment: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.post('/api/v1/inventory/adjust', data);
      const adjustment = response.data.adjustment;
      set((state) => ({ adjustments: [adjustment, ...state.adjustments], isLoading: false }));
      return adjustment;
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Failed to adjust inventory';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  getLowStockSummary: async (threshold = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await api.get(`/api/v1/inventory/low-stock-summary?threshold=${threshold}`);
      set({ lowStockSummary: response.data, isLoading: false });
    } catch (error: any) {
      const errorMessage = error?.message || error?.error || 'Failed to fetch summary';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
