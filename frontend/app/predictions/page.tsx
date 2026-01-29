'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useProductStore } from '@/store/productStore';
import { usePredictionStore } from '@/store/predictionStore';
import Link from 'next/link';

export default function PredictionsPage() {
  const router = useRouter();
  const { user, hasHydrated } = useAuthStore();
  const { products, fetchProducts } = useProductStore();
  const { currentForecast, predictions, requestForecast, getPredictions, loading, error, clearError } =
    usePredictionStore();

  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [days, setDays] = useState<number>(7);
  const [forecastGenerated, setForecastGenerated] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'vendor') {
      router.push('/dashboard');
      return;
    }

    fetchProducts();
  }, [user]);

  const handleGenerateForecast = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!selectedProduct) {
      alert('Please select a product');
      return;
    }

    try {
      await requestForecast(selectedProduct, days);
      setForecastGenerated(true);
    } catch (err) {
      console.error('Forecast error:', err);
    }
  };

  const handleViewPredictions = async (productId: string) => {
    try {
      await getPredictions(productId);
      setSelectedProduct(productId);
      setForecastGenerated(true);
    } catch (err) {
      console.error('Error fetching predictions:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Future Demand</h1>
          <p className="text-gray-600 mt-2">AI-powered predictions to optimize inventory and reduce waste</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Forecast Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Prediction</h2>

              <form onSubmit={handleGenerateForecast} className="space-y-4">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">Select a product...</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} (Current: {product.quantity} {product.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Forecast Days: {days}
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">7-30 days</p>
                </div>

                {/* Error Display */}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !selectedProduct}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? 'Generating...' : 'Generate Prediction'}
                </button>
              </form>

              {/* Quick Stats */}
              {currentForecast && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Prediction Stats</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium text-gray-900">{currentForecast.modelUsed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-medium text-gray-900">{(currentForecast.accuracyScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Predictions:</span>
                      <span className="font-medium text-gray-900">{currentForecast.predictions.length} days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prediction Results */}
          <div className="lg:col-span-2">
            {forecastGenerated && currentForecast ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {/* Recommendations */}
                {currentForecast.recommendations && currentForecast.recommendations.length > 0 && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">📊 Recommendations</h3>
                    <ul className="space-y-2">
                      {currentForecast.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Prediction Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Predicted Qty</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Confidence</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentForecast.predictions.map((pred, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{pred.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="font-semibold">{pred.predicted_quantity.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${pred.confidence_level * 100}%` }}
                                />
                              </div>
                              <span className="text-gray-900">{(pred.confidence_level * 100).toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {pred.lower_bound?.toFixed(1)} - {pred.upper_bound?.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Metadata */}
                {currentForecast.metadata && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {currentForecast.metadata.training_samples && (
                        <div>
                          <span className="text-gray-600">Training Samples:</span>
                          <span className="ml-2 font-medium text-gray-900">{currentForecast.metadata.training_samples}</span>
                        </div>
                      )}
                      {currentForecast.metadata.current_stock !== undefined && (
                        <div>
                          <span className="text-gray-600">Current Stock:</span>
                          <span className="ml-2 font-medium text-gray-900">{currentForecast.metadata.current_stock}</span>
                        </div>
                      )}
                      {currentForecast.generatedAt && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Generated:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(currentForecast.generatedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 mb-4">📈 Select a product and generate a forecast to see predictions</p>
                {products.length === 0 && (
                  <Link
                    href="/products/new"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                  >
                    Add Your First Product
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Predictions */}
        {predictions.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Predictions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Quantity</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Confidence</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Model</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {predictions.slice(0, 5).map((pred) => (
                    <tr key={pred.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-900">{pred.forecastDate}</td>
                      <td className="px-6 py-3 font-medium text-gray-900">{pred.predictedQuantity.toFixed(1)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${pred.confidenceLevel * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-900">{(pred.confidenceLevel * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-gray-900">{pred.modelUsed}</td>
                      <td className="px-6 py-3">
                        <button
                          onClick={() => handleViewPredictions(pred.productId)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
