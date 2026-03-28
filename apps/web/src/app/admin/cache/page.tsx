'use client';

import { useState, useEffect } from 'react';
import { Database, Trash2, RefreshCw, CheckCircle } from 'lucide-react';

export default function CacheManagementPage() {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState<string | null>(null);

  useEffect(() => {
    fetchCacheStats();
  }, []);

  const fetchCacheStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cache/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setCacheStats(data);
    } catch (error) {
      console.error('Error fetching cache stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (cacheType: string) => {
    try {
      setClearing(cacheType);
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cache/clear/${cacheType}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCacheStats();
    } catch (error) {
      console.error('Error clearing cache:', error);
    } finally {
      setClearing(null);
    }
  };

  const cacheTypes = [
    { id: 'all', label: 'All Caches', description: 'Clear all cached data' },
    { id: 'users', label: 'User Cache', description: 'User profiles and sessions' },
    { id: 'posts', label: 'Post Cache', description: 'Posts and threads' },
    { id: 'analytics', label: 'Analytics Cache', description: 'Analytics and metrics' },
    { id: 'search', label: 'Search Cache', description: 'Search results' }
  ];

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
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Cache Management</h1>
              </div>
              <p className="text-gray-600">Manage and clear application caches</p>
            </div>
            <button
              onClick={fetchCacheStats}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cache Statistics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Entries</div>
                <div className="text-3xl font-bold text-gray-900">{cacheStats?.totalEntries || 0}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Cache Size</div>
                <div className="text-3xl font-bold text-gray-900">{cacheStats?.size || '0 MB'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Hit Rate</div>
                <div className="text-3xl font-bold text-gray-900">{cacheStats?.hitRate || '0'}%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Clear Caches</h2>
            <div className="space-y-4">
              {cacheTypes.map((cache) => (
                <div key={cache.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cache.label}</h3>
                    <p className="text-sm text-gray-600">{cache.description}</p>
                  </div>
                  <button
                    onClick={() => clearCache(cache.id)}
                    disabled={clearing === cache.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {clearing === cache.id ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-5 w-5" />
                        Clear
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
