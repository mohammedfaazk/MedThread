'use client';
import React from 'react';

interface HeatmapRow {
  regionName: string;
  symptomTag: string;
  caseCount: number;
  severityAvg: number;
  alertLevel: 'none' | 'watch' | 'epidemic' | 'outbreak';
}

interface Props {
  data: HeatmapRow[];
  regionType: string;
}

function getColorForCases(caseCount: number): string {
  if (caseCount === 0) return '#e5e7eb';
  if (caseCount <= 2) return '#fecaca';
  if (caseCount <= 4) return '#f87171';
  if (caseCount <= 6) return '#ef4444';
  if (caseCount <= 8) return '#dc2626';
  if (caseCount <= 12) return '#b91c1c';
  return '#7f1d1d';
}

export default function FallbackHeatmap({ data, regionType }: Props) {
  // Process data into regions with totals
  const regionData = React.useMemo(() => {
    const regions: Record<string, { total: number; symptoms: string[] }> = {};
    
    data.forEach(item => {
      if (!regions[item.regionName]) {
        regions[item.regionName] = { total: 0, symptoms: [] };
      }
      
      regions[item.regionName].total += item.caseCount;
      if (!regions[item.regionName].symptoms.includes(item.symptomTag)) {
        regions[item.regionName].symptoms.push(item.symptomTag);
      }
    });
    
    return regions;
  }, [data]);

  const sortedRegions = Object.entries(regionData)
    .filter(([_, info]) => info.total > 0)
    .sort(([,a], [,b]) => b.total - a.total);

  return (
    <div className="space-y-4">
      {/* Map placeholder */}
      <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Interactive Map Loading...</h3>
          <p className="text-gray-500">Showing data grid below as fallback</p>
        </div>
      </div>

      {/* Data visualization as cards */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-4">Symptom Data by {regionType}</h3>
        
        {sortedRegions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sortedRegions.map(([regionName, info]) => (
              <div 
                key={regionName}
                className="p-4 rounded-lg border-2 transition-all hover:shadow-md"
                style={{ 
                  backgroundColor: getColorForCases(info.total),
                  borderColor: info.total > 8 ? '#dc2626' : info.total > 4 ? '#f59e0b' : '#10b981',
                  color: info.total > 6 ? 'white' : 'black'
                }}
              >
                <h4 className="font-semibold text-sm mb-2">{regionName}</h4>
                <div className="space-y-1">
                  <p className="text-xs">
                    <span className="font-medium">Cases:</span> {info.total}
                  </p>
                  <p className="text-xs">
                    <span className="font-medium">Symptoms:</span> {info.symptoms.slice(0, 3).join(', ')}
                    {info.symptoms.length > 3 && ` +${info.symptoms.length - 3} more`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No symptom data available for {regionType} level</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="text-sm font-semibold mb-3">Case Count Legend</h4>
        <div className="flex flex-wrap gap-3">
          {[
            { count: 0, label: '0 cases' },
            { count: 2, label: '1-2 cases' },
            { count: 4, label: '3-4 cases' },
            { count: 6, label: '5-6 cases' },
            { count: 8, label: '7-8 cases' },
            { count: 12, label: '9+ cases' }
          ].map(({ count, label }) => (
            <div key={count} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: getColorForCases(count) }}
              />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{sortedRegions.length}</div>
          <div className="text-sm text-gray-600">Affected Regions</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {sortedRegions.reduce((sum, [_, info]) => sum + info.total, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Cases</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(data.map(d => d.symptomTag)).size}
          </div>
          <div className="text-sm text-gray-600">Unique Symptoms</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedRegions.filter(([_, info]) => info.total > 5).length}
          </div>
          <div className="text-sm text-gray-600">High Activity Areas</div>
        </div>
      </div>
    </div>
  );
}