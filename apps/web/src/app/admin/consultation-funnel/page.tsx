'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, CheckCircle, ArrowRight } from 'lucide-react';

interface FunnelMetrics {
  totalRequests: number;
  doctorResponses: number;
  scheduledAppointments: number;
  completedConsultations: number;
  conversionRate: number;
  averageResponseTime: number;
  revenueGenerated: number;
}

export default function ConsultationFunnelPage() {
  const [metrics, setMetrics] = useState<FunnelMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [timeframe]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/consultation-funnel/metrics?timeframe=${timeframe}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const funnelStages = [
    { label: 'Consultation Requests', value: metrics?.totalRequests || 0, icon: Users, color: 'blue' },
    { label: 'Doctor Responses', value: metrics?.doctorResponses || 0, icon: TrendingUp, color: 'green' },
    { label: 'Scheduled Appointments', value: metrics?.scheduledAppointments || 0, icon: Calendar, color: 'purple' },
    { label: 'Completed', value: metrics?.completedConsultations || 0, icon: CheckCircle, color: 'emerald' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Consultation Funnel</h1>
              <p className="text-gray-600 mt-2">Track consultation conversion rates</p>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Conversion Funnel</h2>
            <div className="flex items-center justify-between gap-4">
              {funnelStages.map((stage, index) => {
                const Icon = stage.icon;
                const percentage = metrics?.totalRequests 
                  ? ((stage.value / metrics.totalRequests) * 100).toFixed(1)
                  : '0';
                
                return (
                  <div key={index} className="flex items-center flex-1">
                    <div className="flex-1">
                      <div className={`bg-${stage.color}-50 rounded-lg p-6 text-center`}>
                        <Icon className={`h-8 w-8 text-${stage.color}-600 mx-auto mb-2`} />
                        <div className={`text-3xl font-bold text-${stage.color}-600 mb-1`}>
                          {stage.value}
                        </div>
                        <div className="text-sm text-gray-600 mb-1">{stage.label}</div>
                        <div className="text-xs text-gray-500">{percentage}%</div>
                      </div>
                    </div>
                    {index < funnelStages.length - 1 && (
                      <ArrowRight className="h-6 w-6 text-gray-400 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
              <div className="text-3xl font-bold text-gray-900">
                {metrics?.conversionRate?.toFixed(1) || 0}%
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Response Time</h3>
              <div className="text-3xl font-bold text-gray-900">
                {metrics?.averageResponseTime || 0}h
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Revenue Generated</h3>
              <div className="text-3xl font-bold text-gray-900">
                ₹{metrics?.revenueGenerated?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
