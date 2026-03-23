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

export default function SVGMap({ data, regionType }: Props) {
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

  // State positions for SVG map (simplified coordinates)
  const statePositions: Record<string, { x: number; y: number }> = {
    'Tamil Nadu': { x: 78, y: 85 },
    'Delhi': { x: 77, y: 28 },
    'Maharashtra': { x: 75, y: 65 },
    'Karnataka': { x: 75, y: 75 },
    'West Bengal': { x: 88, y: 55 },
    'Gujarat': { x: 72, y: 50 },
    'Rajasthan': { x: 74, y: 45 },
    'Uttar Pradesh': { x: 80, y: 40 },
    'Kerala': { x: 76, y: 90 },
    'Telangana': { x: 79, y: 70 },
    'Andhra Pradesh': { x: 79, y: 75 },
    'Madhya Pradesh': { x: 78, y: 55 },
    'Bihar': { x: 85, y: 45 },
    'Odisha': { x: 85, y: 65 },
    'Punjab': { x: 75, y: 35 },
    'Haryana': { x: 76, y: 38 },
    'Assam': { x: 92, y: 40 },
    'Jharkhand': { x: 85, y: 50 }
  };

  const getColor = (caseCount: number): string => {
    if (caseCount === 0) return '#e5e7eb';
    if (caseCount <= 5) return '#10b981';
    if (caseCount <= 10) return '#f59e0b';
    if (caseCount <= 20) return '#ef4444';
    return '#dc2626';
  };

  const getRadius = (caseCount: number): number => {
    return Math.max(8, Math.min(25, caseCount * 1.5));
  };

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-300 p-4">
      <div className="relative w-full h-96 overflow-hidden">
        {/* SVG Map */}
        <svg 
          viewBox="65 25 35 70" 
          className="w-full h-full"
          style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)' }}
        >
          {/* India outline (simplified) */}
          <path
            d="M 68 30 L 95 30 L 98 35 L 98 85 L 95 90 L 85 92 L 75 90 L 70 85 L 68 75 L 70 65 L 68 55 L 70 45 L 68 35 Z"
            fill="rgba(156, 163, 175, 0.2)"
            stroke="rgba(156, 163, 175, 0.5)"
            strokeWidth="0.5"
          />
          
          {/* State markers */}
          {Object.entries(regionData).map(([regionName, info]) => {
            const position = statePositions[regionName];
            if (!position || info.total === 0) return null;

            const color = getColor(info.total);
            const radius = getRadius(info.total);

            return (
              <g key={regionName}>
                {/* Marker circle */}
                <circle
                  cx={position.x}
                  cy={position.y}
                  r={radius / 4}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth="0.5"
                  opacity="0.8"
                  className="cursor-pointer hover:opacity-100 transition-opacity"
                >
                  <title>
                    {regionName}: {info.total} cases
                    Symptoms: {info.symptoms.join(', ')}
                  </title>
                </circle>
                
                {/* Pulse animation for high case counts */}
                {info.total > 15 && (
                  <circle
                    cx={position.x}
                    cy={position.y}
                    r={radius / 4}
                    fill="none"
                    stroke={color}
                    strokeWidth="0.3"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values={`${radius / 4};${radius / 2};${radius / 4}`}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.6;0.2;0.6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Overlay info for regions */}
        <div className="absolute inset-0 pointer-events-none">
          {Object.entries(regionData).map(([regionName, info]) => {
            const position = statePositions[regionName];
            if (!position || info.total === 0) return null;

            // Convert SVG coordinates to screen coordinates (approximate)
            const screenX = ((position.x - 65) / 35) * 100;
            const screenY = ((position.y - 25) / 70) * 100;

            return (
              <div
                key={`label-${regionName}`}
                className="absolute text-xs font-medium text-gray-700 pointer-events-auto cursor-pointer"
                style={{
                  left: `${screenX}%`,
                  top: `${screenY}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                title={`${regionName}: ${info.total} cases`}
              >
                {info.total > 10 && (
                  <div className="bg-white/90 px-2 py-1 rounded shadow-sm border">
                    <div className="font-semibold">{regionName}</div>
                    <div className="text-xs">{info.total} cases</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg border">
        <h4 className="text-sm font-semibold mb-2">Case Count</h4>
        <div className="space-y-1">
          {[
            { count: 0, label: 'No cases', color: '#e5e7eb' },
            { count: 5, label: '1-5 cases', color: '#10b981' },
            { count: 10, label: '6-10 cases', color: '#f59e0b' },
            { count: 20, label: '11-20 cases', color: '#ef4444' },
            { count: 25, label: '20+ cases', color: '#dc2626' }
          ].map(({ count, label, color }) => (
            <div key={count} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Panel */}
      <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg border">
        <p className="text-sm font-medium">🗺️ India Symptom Map</p>
        <p className="text-xs text-gray-600 mt-1">
          {Object.keys(regionData).length} regions with data
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Hover over markers for details
        </p>
      </div>

      {/* Region Details */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {Object.entries(regionData)
          .filter(([_, info]) => info.total > 0)
          .sort(([,a], [,b]) => b.total - a.total)
          .slice(0, 8)
          .map(([regionName, info]) => (
            <div 
              key={regionName}
              className="p-2 bg-white/80 rounded border text-xs"
              style={{ borderLeftColor: getColor(info.total), borderLeftWidth: '3px' }}
            >
              <div className="font-medium">{regionName}</div>
              <div className="text-gray-600">{info.total} cases</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}