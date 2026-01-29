import { create } from 'zustand';
import api from '@/lib/api';

export interface DashboardStats {
  todaysRevenue: number;
  revenueChange: number;
  totalProducts: number;
  totalRevenue: number;
}

export interface SalesAnalytics {
  summary: {
    todaysRevenue: number;
    totalRevenue: number;
    totalProfit: number;
    totalSales: number;
    totalProducts: number;
    avgOrderValue: number;
    revenueChange: number;
  };
  salesByCategory: {
    [key: string]: {
      count: number;
      revenue: number;
    };
  };
  topProducts: Array<{
    productId: string;
    productName: string;
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    salesCount: number;
  }>;
  salesTrend: Array<{
    date: string;
    revenue: number;
    salesCount: number;
  }>;
}

export interface MonthlyComparison {
  currentMonth: {
    revenue: number;
    salesCount: number;
  };
  lastMonth: {
    revenue: number;
    salesCount: number;
  };
  change: number;
}

interface AnalyticsStore {
  dashboardStats: DashboardStats | null;
  salesAnalytics: SalesAnalytics | null;
  monthlyComparison: MonthlyComparison | null;
  loading: boolean;
  error: string | null;

  // Actions
  getDashboardStats: () => Promise<void>;
  getSalesAnalytics: (startDate?: string, endDate?: string) => Promise<void>;
  getMonthlyComparison: () => Promise<void>;
  clearError: () => void;
}

const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  dashboardStats: null,
  salesAnalytics: null,
  monthlyComparison: null,
  loading: false,
  error: null,

  getDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/dashboard');
      const stats = response.data.data || response.data;
      
      set({
        dashboardStats: stats,
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch dashboard stats',
        loading: false
      });
      throw error;
    }
  },

  getSalesAnalytics: async (startDate?: string, endDate?: string) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/analytics?${params.toString()}`);
      const analytics = response.data.data || response.data;
      
      set({
        salesAnalytics: analytics,
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch sales analytics',
        loading: false
      });
      throw error;
    }
  },

  getMonthlyComparison: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/analytics/monthly');
      const comparison = response.data.data || response.data;
      
      set({
        monthlyComparison: comparison,
        loading: false
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch monthly comparison',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));

export default useAnalyticsStore;
