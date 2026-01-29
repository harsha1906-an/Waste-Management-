import { create } from 'zustand';
import api from '@/lib/api';

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  category: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  quantity: number;
  unit: string;
  expiryDate?: string;
  sku?: string;
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProducts: (filters?: { category?: string; search?: string }) => Promise<void>;
  getProduct: (id: string) => Promise<void>;
  createProduct: (data: Omit<Product, 'id' | 'vendorId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getLowStockProducts: (threshold?: number) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (filters) => {
    try {
      set({ isLoading: true, error: null });
      
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.search) params.append('search', filters.search);
      
      const response = await api.get(`/api/v1/products?${params.toString()}`);
      const { products } = response;
      
      set({ products, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  getProduct: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`/api/v1/products/${id}`);
      const { product } = response;
      
      set({ selectedProduct: product, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch product';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  createProduct: async (data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.post('/api/v1/products', data);
      const { product } = response;
      
      set((state) => ({
        products: [product, ...state.products],
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create product';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.put(`/api/v1/products/${id}`, data);
      const { product } = response;
      
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? product : p)),
        selectedProduct: product,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update product';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      set({ isLoading: true, error: null });
      
      await api.delete(`/api/v1/products/${id}`);
      
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        selectedProduct: state.selectedProduct?.id === id ? null : state.selectedProduct,
        isLoading: false,
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete product';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  getLowStockProducts: async (threshold = 10) => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await api.get(`/api/v1/products/low-stock?threshold=${threshold}`);
      const { products } = response;
      
      set({ products, isLoading: false });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch low stock products';
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
