import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage (client-side only)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden: You do not have permission');
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error: Please try again later');
          break;
        default:
          console.error(`Error ${status}: ${error.message}`);
      }
      
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: Please check your connection');
      return Promise.reject({ message: 'Network error' });
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
    }
  }
);

export default api;

// ML Service API
export const mlApi: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000',
  timeout: 60000, // ML predictions might take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

// ML API request interceptor
mlApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ML API response interceptor
mlApi.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    console.error('ML API Error:', error.message);
    return Promise.reject(error);
  }
);
