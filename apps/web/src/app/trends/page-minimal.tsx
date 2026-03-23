'use client';
import { useState, useEffect } from 'react';

interface HeatmapRow {
  regionName: string;
  symptomTag: string;
  caseCount: number;
  severityAvg: number;
  alertLevel: 'none' | 'watch' | 'epidemic' | 'outbreak';
}

export default function TrendsPageMinimal() {
  const [data, setData] = useState<HeatmapRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30')
      .then(res => res.json())
      .then(result => {
        setData(result.data || []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Loading symptom data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      </div>
    );
  }

  // Process data
  const regionData: Record<string, number> = {};
  data.forEach(item => {
    regionData[item.regionName] = (regionData[item.regionName] || 0) + item.caseCount;
  });

  const sortedRegions = Object.entries(regionData)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Symptom Trends</h1>
      
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Cases by Region</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedRegions.map(([region, count]) => (
            <div key={region} className="p-4 border rounded-lg">
              <h3 className="font-medium">{region}</h3>
              <p className="text-2xl font-bold text-blue-600">{count}</p>
              <p className="text-sm text-gray-600">cases</p>
            </div>
          ))}
        </div>
        
        {sortedRegions.length === 0 && (
          <p className="text-gray-500 text-center py-8">No data available</p>
        )}
      </div>
    </div>
  );
}