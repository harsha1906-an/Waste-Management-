'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useInventoryStore } from '@/store/inventoryStore';
import useWasteStore from '@/store/wasteStore';
import useAnalyticsStore from '@/store/analyticsStore';

function VendorDashboard({ user }: { user: any }) {
  const { lowStockSummary, getLowStockSummary } = useInventoryStore();
  const { stats, getWasteStats } = useWasteStore();
  const { dashboardStats, getDashboardStats } = useAnalyticsStore();

  useEffect(() => {
    getLowStockSummary(10).catch(() => undefined);
    getDashboardStats().catch(() => undefined);
    const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    getWasteStats(startDate, endDate).catch(() => undefined);
  }, [getLowStockSummary, getDashboardStats, getWasteStats]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {user.businessName || 'Vendor Dashboard'}
          </h1>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.email}!
          </h2>
          <p className="text-gray-600">
            Location: <span className="font-medium">{user.location || 'Not specified'}</span>
          </p>
          <p className="text-gray-600">
            Phone: <span className="font-medium">{user.phone || 'Not specified'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Today's Sales</h3>
            <p className="text-3xl font-bold text-gray-900">
              ₹{dashboardStats?.todaysRevenue?.toFixed(0) || 0}
            </p>
            <p className={`text-sm mt-2 ${(dashboardStats?.revenueChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(dashboardStats?.revenueChange || 0) >= 0 ? '+' : ''}{dashboardStats?.revenueChange || 0}% from yesterday
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">{dashboardStats?.totalProducts || 0}</p>
            <p className="text-sm text-gray-600 mt-2">Manage your inventory</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Low Stock Items</h3>
            <p className="text-3xl font-bold text-gray-900">{lowStockSummary?.lowStockCount || 0}</p>
            <p className="text-sm text-red-600 mt-2">{lowStockSummary?.expiringCount || 0} items expiring soon</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Waste This Month</h3>
            <p className="text-3xl font-bold text-red-600">
              ₹{stats?.summary?.totalCostImpact?.toFixed(0) || 0}
            </p>
            <p className="text-sm text-gray-600 mt-2">{stats?.summary?.totalWaste || 0} incidents</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link href="/products/new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-center hover:bg-blue-50">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium text-gray-700">Add Product</div>
            </Link>
            
            <Link href="/products" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-center hover:bg-blue-50">
              <div className="text-2xl mb-2">📊</div>
              <div className="text-sm font-medium text-gray-700">View Products</div>
            </Link>
            
            <Link href="/sales/new" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-center hover:bg-green-50">
              <div className="text-2xl mb-2">💰</div>
              <div className="text-sm font-medium text-gray-700">Record Sale</div>
            </Link>
            
            <Link href="/inventory/adjust" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 transition text-center hover:bg-orange-50">
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium text-gray-700">Adjust Inventory</div>
            </Link>
            
            <Link href="/predictions" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition text-center hover:bg-purple-50">
              <div className="text-2xl mb-2">📈</div>
              <div className="text-sm font-medium text-gray-700">Future Demand</div>
            </Link>

            <Link href="/waste/log" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 transition text-center hover:bg-red-50">
              <div className="text-2xl mb-2">🗑️</div>
              <div className="text-sm font-medium text-gray-700">Log Waste</div>
            </Link>

            <Link href="/analytics" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition text-center hover:bg-indigo-50">
              <div className="text-2xl mb-2">📉</div>
              <div className="text-sm font-medium text-gray-700">Sales Analytics</div>
            </Link>

            <Link href="/sales" className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 transition text-center hover:bg-teal-50">
              <div className="text-2xl mb-2">📜</div>
              <div className="text-sm font-medium text-gray-700">Sales History</div>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            🤖 AI-Powered Intelligence
          </h3>
          <p className="text-purple-700 mb-4">
            Use demand forecasting to reduce waste by 30-50% and optimize your inventory.
          </p>
          <Link href="/predictions" className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg">
            Try Forecasting →
          </Link>
        </div>

        {stats && stats.summary.totalWaste > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              ⚠️ Waste Reduction Insights
            </h3>
            <p className="text-red-700 mb-4">
              You've logged {stats.summary.totalWaste} waste incident{stats.summary.totalWaste !== 1 ? 's' : ''} this month with a cost impact of ₹{stats.summary.totalCostImpact.toFixed(2)}. Track patterns and reduce waste.
            </p>
            <Link href="/waste" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg">
              View Analytics →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function CustomerDashboard({ user }: { user: any }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Marketplace
          </h1>
          <button
            onClick={() => {
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Welcome back, {user.email}!
          </h2>
          <p className="text-gray-600">
            Discover fresh products from local vendors near you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Available Vendors</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Local sellers near you</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Fresh items available</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">My Orders</h3>
            <p className="text-3xl font-bold text-gray-900">0</p>
            <p className="text-sm text-gray-600 mt-2">Order history</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shopping</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition text-center hover:bg-blue-50">
              <div className="text-2xl mb-2">🏪</div>
              <div className="text-sm font-medium text-gray-700">Browse Vendors</div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition text-center hover:bg-green-50">
              <div className="text-2xl mb-2">🛒</div>
              <div className="text-sm font-medium text-gray-700">My Cart</div>
            </button>
            
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition text-center hover:bg-purple-50">
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-medium text-gray-700">My Orders</div>
            </button>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            🌱 Support Local Farmers!
          </h3>
          <p className="text-green-700">
            By shopping with us, you support local vendors and help reduce food waste.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasHydrated) {
        useAuthStore.setState({ hasHydrated: true });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user.role === 'vendor' ? (
    <VendorDashboard user={user} />
  ) : (
    <CustomerDashboard user={user} />
  );
}
