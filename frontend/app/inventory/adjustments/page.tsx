'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdjustmentsHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { adjustments, fetchAdjustments, isLoading } = useInventoryStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      router.push('/login');
      return;
    }
    fetchAdjustments().catch(() => undefined);
  }, [isAuthenticated, user, fetchAdjustments, router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Inventory Adjustments</h1>
          <Link href="/inventory/adjust" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">New Adjustment</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-600">Loading...</td></tr>
              )}
              {!isLoading && adjustments.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-600">No adjustments yet</td></tr>
              )}
              {!isLoading && adjustments.map((adj) => (
                <tr key={adj.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{new Date(adj.createdAt || '').toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{adj.product?.name || adj.productId}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${adj.type === 'add' ? 'bg-green-100 text-green-800' : adj.type === 'remove' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {adj.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{adj.quantity} {adj.product?.unit}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{adj.reason}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{adj.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
