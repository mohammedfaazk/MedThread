'use client';

import { useEffect, useState } from 'react';
import { MapPin, Filter, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface RegionalSymptomHeatmapProps {
  className?: string;
}

interface HeatmapData {
  location: string;
  totalReports: number;
  pincodeCount: number;
  topSymptoms: Array<{
    symptom: string;
    count: number;
  }>;
  severityDistribution: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  alertLevel: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface RegionalData {
  timeWindow: string;
  locationLevel: string;
  symptomFilter?: string;
  severityFilter?: string;
  period: string;
  totalReports: number;
  heatmapData: HeatmapData[];
  summary: {
    totalLocations: number;
    topLocation: string;
    totalSymptoms: number;
  };
}

export function RegionalSymptomHeatmap({ className = '' }: RegionalSymptomHeatmapProps) {
  const [data, setData] = useState<RegionalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    locationLevel: 'city' as 'city' | 'district' | 'state',
    symptomFilter: '',
    timeWindow: 'month' as 'week' | 'month' | 'quarter',
    severityFilter: '' as '' | 'HIGH' | 'MEDIUM' | 'LOW'
  });

  const [availableSymptoms] = useState([
    'cold', 'fever', 'fatigue', 'cough', 'rash', 'nausea', 'chest pain',
    'headache', 'dizziness', 'sore throat', 'body ache', 'joint pain'
  ]);

  useEffect(() => {
    fetchHeatmapData();
  }, [filters]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('locationLevel', filters.locationLevel);
      params.append('timeWindow', filters.timeWindow);
      if (filters.symptomFilter) params.append('symptom', filters.symptomFilter);
      if (filters.severityFilter) params.append('severity', filters.severityFilter);

      const response = await fetch(
        `${API_URL}/api/regional-symptom-analytics/heatmap?${params}`
      );
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (alertLevel: string) => {
    const colors = {
      CRITICAL: 'bg-red-500 text-white',
      HIGH: 'bg-orange-500 text-white',
      MEDIUM: 'bg-yellow-500 text-white',
      LOW: 'bg-green-500 text-white'
    };
    return colors[alertLevel as keyof typeof colors] || colors.LOW;
  };

  const getAlertIcon = (alertLevel: string) => {
    if (alertLevel === 'CRITICAL' || alertLevel === 'HIGH') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <TrendingUp className="w-4 h-4" />;
  };
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <MapPin className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Regional Symptom Analytics</h2>
            <p className="text-sm text-gray-600">
              Real-time health trends by geography
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Location Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Level
            </label>
            <select
              value={filters.locationLevel}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                locationLevel: e.target.value as 'city' | 'district' | 'state' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="city">City</option>
              <option value="district">District</option>
              <option value="state">State</option>
            </select>
          </div>

          {/* Symptom Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Symptom Filter
            </label>
            <select
              value={filters.symptomFilter}
              onChange={(e) => setFilters(prev => ({ ...prev, symptomFilter: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Symptoms</option>
              {availableSymptoms.map(symptom => (
                <option key={symptom} value={symptom}>
                  {symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Window
            </label>
            <select
              value={filters.timeWindow}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                timeWindow: e.target.value as 'week' | 'month' | 'quarter' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
            </select>
          </div>

          {/* Severity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity Filter
            </label>
            <select
              value={filters.severityFilter}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                severityFilter: e.target.value as '' | 'HIGH' | 'MEDIUM' | 'LOW' 
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Severities</option>
              <option value="HIGH">🔴 High</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="LOW">🟢 Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">Total Reports</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{data.totalReports}</p>
              <p className="text-xs text-gray-500">{data.period}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Locations</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{data.summary.totalLocations}</p>
              <p className="text-xs text-gray-500">Affected areas</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Top Location</span>
              </div>
              <p className="text-lg font-bold text-purple-600">{data.summary.topLocation}</p>
              <p className="text-xs text-gray-500">Most reports</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Symptoms</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">{data.summary.totalSymptoms}</p>
              <p className="text-xs text-gray-500">Unique types</p>
            </div>
          </div>
        )}

        {/* Heatmap Data */}
        {data && data.heatmapData.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Regional Health Data - {filters.locationLevel.charAt(0).toUpperCase() + filters.locationLevel.slice(1)} Level
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.heatmapData.slice(0, 12).map((location, index) => (
                <div key={location.location} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{location.location}</h4>
                      <p className="text-sm text-gray-600">
                        {location.totalReports} reports • {location.pincodeCount} pincodes
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getAlertColor(location.alertLevel)}`}>
                      {getAlertIcon(location.alertLevel)}
                      {location.alertLevel}
                    </div>
                  </div>

                  {/* Top Symptoms */}
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Top Symptoms:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.topSymptoms.slice(0, 3).map((symptom, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {symptom.symptom} ({symptom.count})
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Severity Distribution */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Severity:</p>
                    <div className="flex gap-2 text-xs">
                      <span className="flex items-center gap-1">
                        🔴 {location.severityDistribution.HIGH}
                      </span>
                      <span className="flex items-center gap-1">
                        🟡 {location.severityDistribution.MEDIUM}
                      </span>
                      <span className="flex items-center gap-1">
                        🟢 {location.severityDistribution.LOW}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Example Interaction */}
            {filters.locationLevel === 'city' && filters.symptomFilter === 'cold' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Example: Chennai Cold Reports</span>
                </div>
                <p className="text-sm text-blue-600">
                  47 patients in Chennai have reported cold symptoms this month
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No symptom data available for the selected filters</p>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting the time window or removing filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}