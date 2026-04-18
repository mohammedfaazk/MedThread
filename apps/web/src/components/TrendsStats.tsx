'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Globe, AlertCircle, Users, Calendar } from 'lucide-react';
import { getDiseaseStatistics, getMultipleDiseaseStatistics, DiseaseStats } from '@/lib/api/trends';

interface TrendsStatsProps {
  disease: string;
}

export function TrendsStats({ disease }: TrendsStatsProps) {
  const [stats, setStats] = useState<DiseaseStats | null>(null);
  const [allStats, setAllStats] = useState<Record<string, DiseaseStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [disease]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      if (disease === 'all') {
        const data = await getMultipleDiseaseStatistics();
        setAllStats(data);
        setStats(null);
      } else {
        const data = await getDiseaseStatistics(disease);
        setStats(data);
        setAllStats(null);
      }
    } catch (err: any) {
      console.error('Error fetching stats:', err);
      setError(err.message || 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-600">Loading statistics from Tavily API...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Statistics</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (stats) {
    return (
      <div className="space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-8 h-8 opacity-80" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Total</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.globalCases)}</h3>
            <p className="text-sm opacity-90">Global Cases</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Deaths</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.globalDeaths)}</h3>
            <p className="text-sm opacity-90">Total Deaths</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Recent</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{formatNumber(stats.recentCases)}</h3>
            <p className="text-sm opacity-90">Recent Cases</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-8 h-8 opacity-80" />
              <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Countries</span>
            </div>
            <h3 className="text-3xl font-bold mb-1">{stats.affectedCountries}</h3>
            <p className="text-sm opacity-90">Affected Countries</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-2">AI-Powered Summary</h4>
              <p className="text-sm text-blue-800 leading-relaxed">{stats.summary}</p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Data Sources</h4>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">
              <strong>Last Updated:</strong> {formatDate(stats.lastUpdated)}
            </p>
            <div className="text-xs text-gray-600">
              <strong>Sources:</strong>
              <ul className="mt-1 space-y-1 ml-4">
                {stats.sources.map((source, idx) => (
                  <li key={idx} className="list-disc">
                    <a 
                      href={source} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {source}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Powered by Tavily Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Powered by</span>
          <span className="font-semibold text-blue-600">Tavily AI Search</span>
        </div>
      </div>
    );
  }

  if (allStats) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900">Global Disease Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(allStats).map(([diseaseName, diseaseStats]) => (
            <div key={diseaseName} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <h4 className="text-lg font-bold text-gray-900 mb-4 capitalize">{diseaseName.replace('-', ' ')}</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Global Cases</span>
                  <span className="font-semibold text-blue-600">{formatNumber(diseaseStats.globalCases)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Deaths</span>
                  <span className="font-semibold text-red-600">{formatNumber(diseaseStats.globalDeaths)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recent Cases</span>
                  <span className="font-semibold text-orange-600">{formatNumber(diseaseStats.recentCases)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Countries</span>
                  <span className="font-semibold text-purple-600">{diseaseStats.affectedCountries}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 line-clamp-3">{diseaseStats.summary}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Powered by Tavily Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-6">
          <span>Powered by</span>
          <span className="font-semibold text-blue-600">Tavily AI Search</span>
        </div>
      </div>
    );
  }

  return null;
}
