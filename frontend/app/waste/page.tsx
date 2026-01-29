'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import useWasteStore from '@/store/wasteStore';

export default function WasteAnalytics() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { 
    wasteLogs, 
    stats, 
    loading, 
    error, 
    getWasteLogs, 
    getWasteStats,
    deleteWasteLog,
    clearError 
  } = useWasteStore();

  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      getWasteStats(dateRange.startDate, dateRange.endDate);
      getWasteLogs({ startDate: dateRange.startDate, endDate: dateRange.endDate, limit: 50 });
    }
  }, [isAuthenticated, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange((prev) => ({ ...prev, [field]: value }));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this waste log?')) {
      try {
        await deleteWasteLog(id);
      } catch (err) {
        // Error handled by store
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'expired': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-orange-100 text-orange-800';
      case 'excess': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Waste Analytics</h1>
        <button
          onClick={() => router.push('/waste/log')}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Log Waste
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Filter */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => handleDateChange('startDate', e.target.value)}
              max={dateRange.endDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              min={dateRange.startDate}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading && !stats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Waste Incidents</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.summary.totalWaste}</p>
                  </div>
                  <div className="bg-red-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Cost Impact</p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {formatCurrency(stats.summary.totalCostImpact)}
                    </p>
                  </div>
                  <div className="bg-orange-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Quantity Wasted</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.summary.totalQuantity.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-yellow-100 rounded-full p-3">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Waste by Reason */}
          {stats && stats.wasteByReason && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Waste by Reason</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.wasteByReason).map(([reason, count]) => (
                  <div key={reason} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-600 capitalize">{reason}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Waste by Category */}
          {stats && stats.wasteByCategory && Object.keys(stats.wasteByCategory).length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Waste by Category</h2>
              <div className="space-y-3">
                {Object.entries(stats.wasteByCategory)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <div className="flex items-center space-x-3">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${((count as number) / Math.max(...Object.values(stats.wasteByCategory))) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Top Wasted Products */}
          {stats && stats.topWastedProducts && stats.topWastedProducts.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Wasted Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Incidents
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.topWastedProducts.map((product) => (
                      <tr key={product.productId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {product.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.wasteCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.totalQuantity.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(product.totalCostImpact)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Waste Logs */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Waste Logs</h2>
            {wasteLogs.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No waste logs found for the selected date range.</p>
                <button
                  onClick={() => router.push('/waste/log')}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Log Your First Waste
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost Impact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {wasteLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(log.wasteDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.product?.name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.quantity.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReasonColor(log.reason)}`}>
                            {log.reason}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                          {formatCurrency(log.costImpact)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
