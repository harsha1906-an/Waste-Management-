'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProductStore } from '@/store/productStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useAuthStore } from '@/store/authStore';

export default function AdjustInventoryPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { createAdjustment, isLoading, error, clearError } = useInventoryStore();

  const [productId, setProductId] = useState('');
  const [type, setType] = useState<'add' | 'remove' | 'correction'>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
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

    if (!productId || !quantity || !reason) {
      return;
    }

    try {
      await createAdjustment({
        productId,
        type,
        quantity: parseFloat(quantity),
        reason,
        notes: notes || undefined,
      });
      setSuccess('Inventory adjusted successfully');
      setProductId('');
      setQuantity('');
      setReason('');
      setNotes('');
      setType('add');
    } catch (err) {
      // handled by store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Adjust Inventory</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">Back to dashboard</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Current: {p.quantity} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Adjustment Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add"
                    checked={type === 'add'}
                    onChange={(e) => setType(e.target.value as 'add' | 'remove' | 'correction')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Add Stock (+)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="remove"
                    checked={type === 'remove'}
                    onChange={(e) => setType(e.target.value as 'add' | 'remove' | 'correction')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Remove Stock (-)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="correction"
                    checked={type === 'correction'}
                    onChange={(e) => setType(e.target.value as 'add' | 'remove' | 'correction')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Correction (Set to)</span>
                </label>
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity {type === 'correction' ? '(New Amount)' : '(Delta)'} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                placeholder="e.g., 5"
                required
              />
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                required
              >
                <option value="">Select reason</option>
                <option value="Purchase">New Purchase</option>
                <option value="Sale">Sale (Manual Adjust)</option>
                <option value="Damage">Damaged/Expired</option>
                <option value="Loss">Loss/Theft</option>
                <option value="Return">Customer Return</option>
                <option value="Inventory Count">Physical Inventory Count</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                rows={3}
                placeholder="Additional details..."
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {isLoading ? 'Saving...' : 'Adjust Inventory'}
              </button>
              <Link href="/inventory/adjustments" className="text-blue-600 hover:underline">View adjustments</Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}
          </form>
        </div>
      </main>
    </div>
  );
}
