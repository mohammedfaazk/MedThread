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

export default function SimpleGrid({ data, regionType }: Props) {
  // Process data
  const regionData: Record<string, { total: number; symptoms: string[] }> = {};
  
  data.forEach(item => {
    if (!regionData[item.regionName]) {
      regionData[item.regionName] = { total: 0, symptoms: [] };
    }
    regionData[item.regionName].total += item.caseCount;
    if (!regionData[item.regionName].symptoms.includes(item.symptomTag)) {
      regionData[item.regionName].symptoms.push(item.symptomTag);
    }
  });

  const sortedRegions = Object.entries(regionData)
    .filter(([_, info]) => info.total > 0)
    .sort(([,a], [,b]) => b.total - a.total);

  const getColor = (count: number) => {
    if (count <= 2) return 'bg-green-100 border-green-300 text-green-800';
    if (count <= 5) return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    if (count <= 10) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-red-100 border-red-300 text-red-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-blue-600">{sortedRegions.length}</div>
          <div className="text-sm text-gray-600">Regions</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-red-600">
            {sortedRegions.reduce((sum, [_, info]) => sum + info.total, 0)}
          </div>
          <div className="text-sm text-gray-600">Total Cases</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-orange-600">
            {new Set(data.map(d => d.symptomTag)).size}
          </div>
          <div className="text-sm text-gray-600">Symptoms</div>
        </div>
        <div className="bg-white p-4 rounded-lg border text-center">
          <div className="text-2xl font-bold text-green-600">
            {sortedRegions.filter(([_, info]) => info.total > 5).length}
          </div>
          <div className="text-sm text-gray-600">High Activity</div>
        </div>
      </div>

      {/* Region Cards */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Symptom Cases by {regionType}</h3>
        
        {sortedRegions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedRegions.map(([regionName, info]) => (
              <div 
                key={regionName}
                className={`p-4 rounded-lg border-2 ${getColor(info.total)}`}
              >
                <h4 className="font-semibold mb-2">{regionName}</h4>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Cases:</span> {info.total}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Symptoms:</span>
                  </p>
                  <div className="text-xs">
                    {info.symptoms.slice(0, 4).map(symptom => (
                      <span key={symptom} className="inline-block bg-white bg-opacity-50 rounded px-2 py-1 mr-1 mb-1">
                        {symptom}
                      </span>
                    ))}
                    {info.symptoms.length > 4 && (
                      <span className="text-xs opacity-75">+{info.symptoms.length - 4} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg">No symptom data available</p>
            <p className="text-sm">Try selecting a different region type or refresh the data</p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg border p-4">
        <h4 className="font-semibold mb-3">Case Count Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm">1-2 cases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm">3-5 cases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span className="text-sm">6-10 cases</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm">11+ cases</span>
          </div>
        </div>
      </div>
    </div>
  );
}