'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const { isAuthenticated, user } = useAuthStore();
  const { selectedProduct, getProduct, updateProduct, isLoading, error, clearError } = useProductStore();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    unit: '',
    expiryDate: '',
    sku: '',
  });

  const [profitMargin, setProfitMargin] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'vendor') {
      router.push('/login');
      return;
    }
    
    if (productId) {
      getProduct(productId).catch(() => router.push('/products'));
    }
  }, [isAuthenticated, user, productId, getProduct, router]);

  useEffect(() => {
    if (selectedProduct && selectedProduct.id === productId) {
      setFormData({
        name: selectedProduct.name,
        category: selectedProduct.category,
        description: selectedProduct.description || '',
        costPrice: String(selectedProduct.costPrice),
        sellingPrice: String(selectedProduct.sellingPrice),
        quantity: String(selectedProduct.quantity),
        unit: selectedProduct.unit,
        expiryDate: selectedProduct.expiryDate ? selectedProduct.expiryDate.split('T')[0] : '',
        sku: selectedProduct.sku || '',
      });
    }
  }, [selectedProduct, productId]);

  useEffect(() => {
    const cost = parseFloat(formData.costPrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    if (cost > 0) {
      setProfitMargin(((selling - cost) / cost) * 100);
    } else {
      setProfitMargin(0);
    }
  }, [formData.costPrice, formData.sellingPrice]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await updateProduct(productId, {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        quantity: parseFloat(formData.quantity),
        expiryDate: formData.expiryDate || undefined,
      });
      router.push('/products');
    } catch (err) {
      // Error handled by store
    }
  };

  if (isLoading && !selectedProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Other'];
  const units = ['kg', 'liters', 'pieces', 'grams', 'dozens'];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <Link href="/products" className="text-blue-600 hover:underline">
            Back to Products
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="e.g., Tomatoes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="Product description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price (₹) *
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price (₹) *
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="120.00"
                />
              </div>

              {profitMargin !== 0 && (
                <div className="md:col-span-2">
                  <div className={`p-4 rounded-lg ${profitMargin >= 20 ? 'bg-green-50 border border-green-200' : profitMargin >= 10 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className="text-sm font-medium">
                      Profit Margin: <span className="text-lg">{profitMargin.toFixed(2)}%</span>
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                >
                  <option value="">Select unit</option>
                  {units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
                  placeholder="PROD-001"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Update Product'}
              </button>
              <Link
                href="/products"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
