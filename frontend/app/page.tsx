'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-5xl w-full px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Reduce Waste. Increase Profits.
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered demand forecasting for local vendors to minimize waste by 30-50%
          </p>
          
          {/* CTA Buttons */}
          <div className="flex justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Demand Forecasting
            </h3>
            <p className="text-gray-600">
              AI predicts customer demand with 85%+ accuracy using historical data
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-time Analytics
            </h3>
            <p className="text-gray-600">
              Track sales, inventory, and waste patterns in real-time dashboards
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-4xl mb-4">♻️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Waste Reduction
            </h3>
            <p className="text-gray-600">
              Reduce food waste by 30-50% with smart inventory recommendations
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600">30-50%</p>
              <p className="text-gray-600 mt-2">Waste Reduction</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">85%+</p>
              <p className="text-gray-600 mt-2">Forecast Accuracy</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600">24/7</p>
              <p className="text-gray-600 mt-2">Real-time Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
