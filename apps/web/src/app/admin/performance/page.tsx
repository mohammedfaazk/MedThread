'use client';

import { useState, useEffect } from 'react';
import { Activity, Cpu, Database, Zap, TrendingUp } from 'lucide-react';

export default function PerformanceMonitorPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/performance-monitor/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Performance Monitor</h1>
          </div>
          <p className="text-gray-600 mt-2">Real-time system performance metrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'CPU Usage', value: `${metrics?.cpu || 0}%`, icon: Cpu, color: 'blue' },
            { label: 'Memory', value: `${metrics?.memory || 0}%`, icon: Database, color: 'green' },
            { label: 'Response Time', value: `${metrics?.responseTime || 0}ms`, icon: Zap, color: 'yellow' },
            { label: 'Requests/min', value: metrics?.requestsPerMinute || 0, icon: TrendingUp, color: 'purple' }
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                  <h3 className="text-sm font-medium text-gray-600">{metric.label}</h3>
                </div>
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>API Server</span>
                <span className="text-green-600">Healthy</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Database</span>
                <span className="text-green-600">Healthy</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cache</span>
                <span className="text-yellow-600">Warning</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
