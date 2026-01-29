import { create } from 'zustand';
import api from '@/lib/api';

export interface PredictionPoint {
  date: string;
  predicted_quantity: number;
  confidence_level: number;
  lower_bound: number;
  upper_bound: number;
}

export interface Prediction {
  id: string;
  productId: string;
  vendorId: string;
  forecastDate: string;
  predictedQuantity: number;
  confidenceLevel: number;
  modelUsed: string;
  recommendations: string[];
  createdAt: string;
}

export interface PredictionResponse {
  predictions: PredictionPoint[];
  modelUsed: string;
  accuracyScore: number;
  recommendations: string[];
  metadata: Record<string, any>;
  generatedAt: string;
}

interface PredictionStore {
  predictions: Prediction[];
  currentForecast: PredictionResponse | null;
  loading: boolean;
  error: string | null;

  // Actions
  requestForecast: (productId: string, days?: number) => Promise<PredictionResponse>;
  getPredictions: (productId: string) => Promise<Prediction[]>;
  getVendorPredictions: () => Promise<Prediction[]>;
  batchRequestForecast: (productIds: string[], days?: number) => Promise<any>;
  clearError: () => void;
}

export const usePredictionStore = create<PredictionStore>((set) => ({
  predictions: [],
  currentForecast: null,
  loading: false,
  error: null,

  requestForecast: async (productId: string, days = 7) => {
    set({ loading: true, error: null });
    try {
      console.log('[Forecast] Requesting forecast for', productId, 'days:', days);
      const response = await api.post('/api/v1/predictions', {
        productId,
        days,
      });

      console.log('[Forecast] Response data:', response.data);
      
      // Backend returns { data: { predictions, ... } }
      const forecastData = response.data?.data || response.data;
      console.log('[Forecast] Forecast data:', forecastData);
      
      set({ currentForecast: forecastData });
      return forecastData;
    } catch (error: any) {
      console.error('[Forecast] Error:', error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to generate forecast';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getPredictions: async (productId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/api/v1/predictions/product/${productId}`);
      const data = response.data || response;
      set({ predictions: data.data || [] });
      return data.data || [];
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to fetch predictions';
      set({ error: errorMsg });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  getVendorPredictions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/v1/predictions/vendor');
      const data = response.data || response;
      set({ predictions: data.data || [] });
      return data.data || [];
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to fetch predictions';
      set({ error: errorMsg });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  batchRequestForecast: async (productIds: string[], days = 7) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/v1/predictions/batch', {
        productIds,
        days,
      });

      const data = response.data || response;
      set({ predictions: data.data?.predictions || [] });
      return data.data;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || error?.message || 'Batch forecast failed';
      set({ error: errorMsg });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
