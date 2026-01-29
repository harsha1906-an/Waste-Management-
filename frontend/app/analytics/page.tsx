'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import useAnalyticsStore from '@/store/analyticsStore';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();
  const { salesAnalytics, monthlyComparison, loading, error, getSalesAnalytics, getMonthlyComparison, clearError } = useAnalyticsStore();

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
      getSalesAnalytics(dateRange.startDate, dateRange.endDate);
      getMonthlyComparison();
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-600 mt-1">Track your business performance and trends</p>
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Back to Dashboard
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

      {loading && !salesAnalytics ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          {salesAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {formatCurrency(salesAnalytics.summary.totalRevenue)}
                      </p>
                    </div>
                    <div className="bg-green-100 rounded-full p-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{salesAnalytics.summary.totalSales} total sales</p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Profit</p>
                      <p className="text-3xl font-bold text-green-600 mt-2">
                        {formatCurrency(salesAnalytics.summary.totalProfit)}
                      </p>
                    </div>
                    <div className="bg-blue-100 rounded-full p-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Net profit margin</p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {formatCurrency(salesAnalytics.summary.avgOrderValue)}
                      </p>
                    </div>
                    <div className="bg-purple-100 rounded-full p-3">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Per transaction</p>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {formatCurrency(salesAnalytics.summary.todaysRevenue)}
                      </p>
                    </div>
                    <div className="bg-orange-100 rounded-full p-3">
                      <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 ${salesAnalytics.summary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {salesAnalytics.summary.revenueChange >= 0 ? '+' : ''}{salesAnalytics.summary.revenueChange}% from yesterday
                  </p>
                </div>
              </div>

              {/* Monthly Comparison */}
              {monthlyComparison && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Comparison</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-blue-900">Current Month</p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {formatCurrency(monthlyComparison.currentMonth.revenue)}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">{monthlyComparison.currentMonth.salesCount} sales</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-900">Last Month</p>
                      <p className="text-2xl font-bold text-gray-600 mt-2">
                        {formatCurrency(monthlyComparison.lastMonth.revenue)}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">{monthlyComparison.lastMonth.salesCount} sales</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-green-900">Growth</p>
                      <p className={`text-2xl font-bold mt-2 ${monthlyComparison.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {monthlyComparison.change >= 0 ? '+' : ''}{monthlyComparison.change}%
                      </p>
                      <p className="text-sm text-green-700 mt-1">Month-over-month</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sales Trend Chart */}
              {salesAnalytics.salesTrend && salesAnalytics.salesTrend.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Trend</h2>
                  <div className="space-y-3">
                    {salesAnalytics.salesTrend.map((trend, index) => {
                      const maxRevenue = Math.max(...salesAnalytics.salesTrend.map(t => t.revenue));
                      const percentage = (trend.revenue / maxRevenue) * 100;
                      return (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="w-24 text-sm font-medium text-gray-700">{formatDate(trend.date)}</div>
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-8 relative">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-8 rounded-full flex items-center justify-end pr-3"
                                style={{ width: `${percentage}%` }}
                              >
                                <span className="text-xs font-semibold text-white">
                                  {formatCurrency(trend.revenue)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="w-20 text-sm text-gray-600 text-right">{trend.salesCount} sales</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sales by Category */}
              {salesAnalytics.salesByCategory && Object.keys(salesAnalytics.salesByCategory).length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sales by Category</h2>
                  <div className="space-y-4">
                    {Object.entries(salesAnalytics.salesByCategory)
                      .sort(([, a], [, b]) => b.revenue - a.revenue)
                      .map(([category, data]) => {
                        const totalRevenue = Object.values(salesAnalytics.salesByCategory).reduce(
                          (sum, cat) => sum + cat.revenue,
                          0
                        );
                        const percentage = (data.revenue / totalRevenue) * 100;
                        return (
                          <div key={category} className="border-b border-gray-200 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{category}</p>
                                <p className="text-xs text-gray-500">{data.count} sales</p>
                              </div>
                              <p className="text-lg font-bold text-gray-900">{formatCurrency(data.revenue)}</p>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% of total revenue</p>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Top Products */}
              {salesAnalytics.topProducts && salesAnalytics.topProducts.length > 0 && (
                <div className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Top Selling Products</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Sales
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Revenue
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {salesAnalytics.topProducts.map((product, index) => (
                          <tr key={product.productId} className={index < 3 ? 'bg-yellow-50' : ''}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-900' :
                                index === 2 ? 'bg-orange-300 text-orange-900' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.salesCount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.totalQuantity.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                              {formatCurrency(product.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {salesAnalytics.summary.totalSales === 0 && (
                <div className="bg-white shadow-md rounded-lg p-12 text-center">
                  <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No Sales Data</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    There are no sales recorded in the selected date range.
                  </p>
                  <button
                    onClick={() => router.push('/sales/new')}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Record Your First Sale
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
