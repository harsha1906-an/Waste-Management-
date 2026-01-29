'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSalesStore } from '@/store/salesStore';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function SalesHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { sales, fetchSales, isLoading, error } = useSalesStore();
  const { products, fetchProducts } = useProductStore();

  const [productId, setProductId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      router.push('/login');
      return;
    }
    fetchSales().catch(() => undefined);
    if (!products.length) {
      fetchProducts().catch(() => undefined);
    }
  }, [isAuthenticated, user, fetchSales, fetchProducts, products.length, router]);

  const handleFilter = async () => {
    await fetchSales({ startDate, endDate, productId: productId || undefined });
  };

  const totalRevenue = useMemo(() => sales.reduce((sum, s) => sum + Number(s.total), 0), [sales]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Sales History</h1>
          <Link href="/sales/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Record Sale</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="">All products</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={handleFilter} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Apply</button>
              <button
                onClick={() => { setProductId(''); setStartDate(''); setEndDate(''); fetchSales(); }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
              >
                Reset
              </button>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700">Total revenue: ₹{totalRevenue.toFixed(2)}</div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-600">Loading...</td></tr>
              )}
              {!isLoading && sales.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-600">No sales yet</td></tr>
              )}
              {!isLoading && sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(sale.soldAt).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sale.product?.name || sale.productId}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{sale.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{Number(sale.unitPrice).toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">₹{Number(sale.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}