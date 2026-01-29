'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';

export default function ProductsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { products, fetchProducts, deleteProduct, isLoading, error, clearError } = useProductStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchProducts({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchTerm || undefined,
    });
  }, [isAuthenticated, router, fetchProducts, selectedCategory, searchTerm]);

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
      } catch (err) {
        // Error is handled by store
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categories = ['Vegetables', 'Fruits', 'Dairy', 'Grains', 'Spices', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/products/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Add Product
            </Link>
            <button
              onClick={() => {
                useAuthStore.getState().logout();
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-xs mt-2 underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 bg-white"
            />

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Products Table */}
        {!isLoading && (
          <>
            {products.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <div className="text-5xl mb-4">📦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first product to track inventory and sales.
                </p>
                <Link
                  href="/products/new"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add First Product
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-300">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cost</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Selling</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Margin</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => {
                      const margin = ((product.sellingPrice - product.costPrice) / product.costPrice) * 100;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {product.quantity} {product.unit}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{parseFloat(String(product.costPrice)).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">₹{parseFloat(String(product.sellingPrice)).toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              {margin.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm flex gap-2">
                            <Link
                              href={`/products/${product.id}/edit`}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
