'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

export default function PlatformRevenueDashboard() {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [periodType, setPeriodType] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    subscriptionRevenue: 0,
    commissionRevenue: 0,
    advertisingRevenue: 0,
    activeSubscriptions: 0,
    consultationsCount: 0
  });

  useEffect(() => {
    fetchRevenueData();
  }, [periodType]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/revenue/platform-analytics', {
        params: { periodType }
      });

      if (response.data.success) {
        const data = response.data.data.revenue;
        setRevenueData(data);

        // Calculate summary
        const total = data.reduce((sum: number, item: any) => sum + parseFloat(item.total_revenue), 0);
        const subscription = data.reduce((sum: number, item: any) => sum + parseFloat(item.subscription_revenue), 0);
        const commission = data.reduce((sum: number, item: any) => sum + parseFloat(item.commission_revenue), 0);
        const advertising = data.reduce((sum: number, item: any) => sum + parseFloat(item.advertising_revenue), 0);
        const latestData = data[0] || {};

        setSummary({
          totalRevenue: total,
          subscriptionRevenue: subscription,
          commissionRevenue: commission,
          advertisingRevenue: advertising,
          activeSubscriptions: latestData.active_subscriptions || 0,
          consultationsCount: data.reduce((sum: number, item: any) => sum + item.consultations_count, 0)
        });
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Revenue Dashboard</h1>
        <p className="text-gray-600">Monitor platform monetization and growth</p>
      </div>

      {/* Period Selector */}
      <div className="mb-6 flex gap-2">
        {['daily', 'weekly', 'monthly', 'quarterly'].map((period) => (
          <button
            key={period}
            onClick={() => setPeriodType(period)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              periodType === period
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatCurrency(summary.totalRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">All revenue streams</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Subscriptions</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {formatCurrency(summary.subscriptionRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {summary.activeSubscriptions} active subscriptions
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Commissions</h3>
            <span className="text-2xl">💳</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {formatCurrency(summary.commissionRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {summary.consultationsCount} consultations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Advertising</h3>
            <span className="text-2xl">📢</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {formatCurrency(summary.advertisingRevenue)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Ad revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue Mix</h3>
            <span className="text-2xl">📈</span>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Subscriptions</span>
              <span className="font-medium">
                {summary.totalRevenue > 0
                  ? Math.round((summary.subscriptionRevenue / summary.totalRevenue) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Commissions</span>
              <span className="font-medium">
                {summary.totalRevenue > 0
                  ? Math.round((summary.commissionRevenue / summary.totalRevenue) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Advertising</span>
              <span className="font-medium">
                {summary.totalRevenue > 0
                  ? Math.round((summary.advertisingRevenue / summary.totalRevenue) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : revenueData.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No data available</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Period
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Subscriptions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Commissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Advertising
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Consultations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {revenueData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.period_start).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      {formatCurrency(parseFloat(item.total_revenue))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-blue-600">
                      {formatCurrency(parseFloat(item.subscription_revenue))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                      {formatCurrency(parseFloat(item.commission_revenue))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-purple-600">
                      {formatCurrency(parseFloat(item.advertising_revenue))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                      {item.consultations_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
