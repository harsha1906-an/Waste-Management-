// User Types
export interface User {
  id: string;
  email: string;
  role: 'vendor' | 'customer' | 'admin';
  businessName?: string;
  location?: string;
  phone?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  businessName: string;
  location: string;
  phone: string;
  role: 'vendor' | 'customer';
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Product Types
export interface Product {
  id: string;
  vendorId: string;
  name: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  unit: 'kg' | 'liter' | 'piece' | 'dozen' | 'gram';
  expiryDate?: string;
  imageUrl?: string;
  lowStockThreshold: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory = 
  | 'vegetables'
  | 'fruits'
  | 'dairy'
  | 'meat'
  | 'bakery'
  | 'grains'
  | 'beverages'
  | 'snacks'
  | 'other';

export interface CreateProductData {
  name: string;
  category: ProductCategory;
  price: number;
  stockQuantity: number;
  unit: 'kg' | 'liter' | 'piece' | 'dozen' | 'gram';
  expiryDate?: string;
  imageUrl?: string;
  lowStockThreshold?: number;
  description?: string;
}

// Sales Types
export interface Sale {
  id: string;
  vendorId: string;
  productId: string;
  product?: Product;
  quantity: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  saleDate: string;
  createdAt: string;
}

export interface CreateSaleData {
  productId: string;
  quantity: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
}

// Prediction Types
export interface Prediction {
  id: string;
  productId: string;
  product?: Product;
  forecastDate: string;
  predictedQuantity: number;
  confidenceLevel: number;
  modelUsed: string;
  createdAt: string;
}

export interface ForecastRequest {
  productId: string;
  days: number;
}

// Waste Types
export interface WasteLog {
  id: string;
  productId: string;
  product?: Product;
  vendorId: string;
  quantityWasted: number;
  reason: 'expired' | 'damaged' | 'spoiled' | 'unsold' | 'other';
  valueLost: number;
  notes?: string;
  loggedAt: string;
}

export interface CreateWasteLogData {
  productId: string;
  quantityWasted: number;
  reason: 'expired' | 'damaged' | 'spoiled' | 'unsold' | 'other';
  notes?: string;
}

// Dashboard Types
export interface DashboardMetrics {
  todaySales: number;
  todaySalesChange: number;
  totalProducts: number;
  lowStockProducts: number;
  expiringProducts: number;
  wasteReduction: number;
  totalRevenue: number;
  revenueChange: number;
}

export interface SalesChartData {
  date: string;
  sales: number;
  predictions?: number;
}

// Report Types
export interface SalesReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    category: ProductCategory;
    count: number;
    revenue: number;
  }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  categoryBreakdown: Array<{
    category: ProductCategory;
    count: number;
    value: number;
  }>;
}

export interface WasteReport {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalWaste: number;
  totalValueLost: number;
  wasteByReason: Array<{
    reason: string;
    count: number;
    valueLost: number;
  }>;
  wasteByProduct: Array<{
    productId: string;
    productName: string;
    quantityWasted: number;
    valueLost: number;
  }>;
}

// Alert Types
export interface Alert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'high_demand' | 'waste_alert' | 'info';
  title: string;
  message: string;
  productId?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

// Order Types
export interface Order {
  id: string;
  customerId: string;
  vendorId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
  orderDate: string;
  deliveryDate?: string;
}

export interface OrderItem {
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Filter Types
export interface ProductFilters {
  category?: ProductCategory;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  expiringIn?: number; // days
}

export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  productId?: string;
  paymentMethod?: string;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}
