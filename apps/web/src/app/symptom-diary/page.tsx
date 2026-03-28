'use client';

import { useState, useEffect } from 'react';
import DiaryEntry from '@/components/symptom-diary/DiaryEntry';
import { useAuth } from '@/hooks/useAuth';
import PageLoader from '@/components/PageLoader';

export default function SymptomDiaryPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchStats();
    }
  }, [user, filter]);

  const fetchEntries = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('isResolved', filter === 'resolved' ? 'true' : 'false');
      }
      
      const response = await fetch(`/api/v1/symptom-diary/entries/${user.id}?${params}`);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`/api/v1/symptom-diary/statistics/${user.id}`);
      const data = await response.json();
      setStats(data.statistics);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleResolve = async (entryId: string) => {
    try {
      await fetch(`/api/v1/symptom-diary/entries/${entryId}/resolve`, {
        method: 'POST'
      });
      fetchEntries();
      fetchStats();
    } catch (error) {
      console.error('Failed to resolve entry:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your symptom diary</p>
          <a href="/login" className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition">
            Log In
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Symptom Diary</h1>
          <p className="text-gray-600">Track your symptoms and monitor healing progress</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Total Entries</div>
              <div className="text-3xl font-bold text-orange-600">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-blue-600">{stats.active}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Resolved</div>
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-1">Resolution Rate</div>
              <div className="text-3xl font-bold text-purple-600">{Math.round(stats.resolutionRate)}%</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'active'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'resolved'
                ? 'bg-orange-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Resolved
          </button>
        </div>

        {/* Add Button */}
        <div className="mb-6">
          <a
            href="/symptom-diary/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            <span className="text-xl">+</span>
            New Entry
          </a>
        </div>

        {/* Entries */}
        <div className="space-y-4">
          {entries.map((entry: any) => (
            <DiaryEntry
              key={entry.id}
              entry={entry}
              onUpdate={() => {}}
              onAddPhoto={() => {}}
              onResolve={handleResolve}
            />
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">📔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Entries Yet</h3>
            <p className="text-gray-600 mb-4">Start tracking your symptoms to monitor your health</p>
            <a
              href="/symptom-diary/new"
              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Create First Entry
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
