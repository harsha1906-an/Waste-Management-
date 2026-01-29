'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { useSalesStore } from '@/store/salesStore';
import { useAuthStore } from '@/store/authStore';

export default function RecordSalePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { createSale, isLoading, error, clearError } = useSalesStore();

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [soldAt, setSoldAt] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      router.push('/login');
      return;
    }
    if (!products.length) {
      fetchProducts().catch(() => undefined);
    }
  }, [isAuthenticated, user, products.length, fetchProducts, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccess('');

    if (!productId || !quantity || !unitPrice) {
      return;
    }

    try {
      await createSale({
        productId,
        quantity: parseFloat(quantity),
        unitPrice: parseFloat(unitPrice),
        soldAt: soldAt || undefined,
      });
      setSuccess('Sale recorded successfully');
      setQuantity('');
      setUnitPrice('');
      setSoldAt('');
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Record Sale</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.quantity} {p.unit} available)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g., 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sold At (optional)</label>
              <input
                type="datetime-local"
                value={soldAt}
                onChange={(e) => setSoldAt(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {isLoading ? 'Saving...' : 'Save Sale'}
              </button>
              <Link href="/sales" className="text-blue-600 hover:underline">View sales history</Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </form>
        </div>
      </main>
    </div>
  );
}