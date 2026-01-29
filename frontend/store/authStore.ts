import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';
import type { User, LoginCredentials, SignupData, AuthResponse } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasHydrated: boolean;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

// Normalize backend auth responses (supports axios interceptor stripping .data)
const extractAuth = (payload: any) => {
  const data = payload?.data ?? payload;
  return {
    user: data?.user ?? data?.data?.user,
    token: data?.token ?? data?.data?.token,
  } as { user: User | null; token: string | null };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      hasHydrated: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/v1/auth/login', credentials);
          const { user, token } = extractAuth(response);

          if (!user || !token) throw new Error('Invalid login response');

          if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);

          set({ user, token, isAuthenticated: true, error: null });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Login failed. Please check your credentials.';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (data: SignupData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/api/v1/auth/signup', data);
          const { user, token } = extractAuth(response);

          if (!user || !token) throw new Error('Invalid signup response');

          if (typeof window !== 'undefined') localStorage.setItem('auth_token', token);

          set({ user, token, isAuthenticated: true, error: null });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Signup failed. Please try again.';
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: async () => {
        try {
          const token = typeof window !== 'undefined' 
            ? localStorage.getItem('auth_token') 
            : null;
          
          if (!token) {
            set({ isAuthenticated: false, user: null, token: null });
            return;
          }
          
          // Verify token with backend
          const response = await api.get<{ data: { user: User } }>('/api/v1/auth/me');
          const { user } = extractAuth(response);

          if (!user) throw new Error('Invalid session');

          set({ user, token, isAuthenticated: true });
        } catch (error) {
          // Token invalid or expired
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
          }
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            state.hasHydrated = true;
          }
        };
      },
    }
  )
);
