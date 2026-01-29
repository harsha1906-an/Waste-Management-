'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import useWasteStore, { LogWasteData } from '@/store/wasteStore';
import { useProductStore } from '@/store/productStore';

export default function LogWaste() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated, user } = useAuthStore();
  const { logWaste, loading, error, clearError } = useWasteStore();
  const { products, getProducts } = useProductStore();

  const [formData, setFormData] = useState<LogWasteData>({
    productId: '',
    quantity: 0,
    reason: 'expired',
    wasteDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, hasHydrated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      getProducts();
    }
  }, [isAuthenticated, getProducts]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!hasHydrated || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setSuccessMessage('');

    if (!formData.productId) {
      return;
    }

    if (formData.quantity <= 0) {
      return;
    }

    try {
      const submitData = { ...formData };
      if (!submitData.notes) {
        delete submitData.notes;
      }

      await logWaste(submitData);
      setSuccessMessage('Waste logged successfully!');
      
      // Reset form
      setFormData({
        productId: '',
        quantity: 0,
        reason: 'expired',
        wasteDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Log Waste</h1>
          <button
            onClick={() => router.push('/waste')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Analytics
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          {/* Product Selection */}
          <div className="mb-6">
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-2">
              Product <span className="text-red-500">*</span>
            </label>
            <select
              id="productId"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {product.category}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Wasted <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity || ''}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter quantity"
            />
          </div>

          {/* Reason */}
          <div className="mb-6">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="expired">Expired</option>
              <option value="damaged">Damaged</option>
              <option value="excess">Excess/Overstocked</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Waste Date */}
          <div className="mb-6">
            <label htmlFor="wasteDate" className="block text-sm font-medium text-gray-700 mb-2">
              Waste Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="wasteDate"
              name="wasteDate"
              value={formData.wasteDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional details..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging...
                </>
              ) : (
                'Log Waste'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
