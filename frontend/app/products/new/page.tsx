'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { createProduct, isLoading, error, clearError } = useProductStore();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Vegetables',
    description: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    unit: 'kg',
    expiryDate: '',
    sku: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }

    if (!formData.costPrice) {
      errors.costPrice = 'Cost price is required';
    } else if (parseFloat(formData.costPrice) < 0) {
      errors.costPrice = 'Cost price cannot be negative';
    }

    if (!formData.sellingPrice) {
      errors.sellingPrice = 'Selling price is required';
    } else if (parseFloat(formData.sellingPrice) < parseFloat(formData.costPrice || '0')) {
      errors.sellingPrice = 'Selling price must be greater than cost price';
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (parseFloat(formData.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await createProduct({
        name: formData.name,
        category: formData.category,
        description: formData.description,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        sku: formData.sku,
        isActive: true,
      } as any);

      router.push('/products');
    } catch (err) {
      // Error is handled by store
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Other'];
  const units = ['kg', 'liters', 'pieces', 'boxes', 'bundles', 'crates'];

  const costPrice = parseFloat(formData.costPrice) || 0;
  const sellingPrice = parseFloat(formData.sellingPrice) || 0;
  const margin = costPrice > 0 ? ((sellingPrice - costPrice) / costPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-700">
            ← Back to Products
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="e.g., Fresh Tomatoes"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU (Optional)
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="e.g., TOM-001"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="Add product details..."
                rows={3}
              />
            </div>

            {/* Cost Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Price (₹) *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="0.00"
              />
              {validationErrors.costPrice && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.costPrice}</p>
              )}
            </div>

            {/* Selling Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price (₹) *
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="0.00"
              />
              {validationErrors.sellingPrice && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.sellingPrice}</p>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                placeholder="0"
              />
              {validationErrors.quantity && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.quantity}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
              />
            </div>
          </div>

          {/* Profit Margin Preview */}
          {formData.costPrice && formData.sellingPrice && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Estimated Profit Margin:</strong>{' '}
                <span className={margin >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {margin.toFixed(1)}%
                </span>
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="mt-8 flex gap-4 justify-end">
            <Link
              href="/products"
              className="px-6 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
