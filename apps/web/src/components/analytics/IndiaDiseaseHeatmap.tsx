'use client';

import { useState } from 'react';
import { MapPin, AlertTriangle, TrendingUp, Activity, Info } from 'lucide-react';
import { 
  INDIA_DISEASE_DATA, 
  getStateColor, 
  getStateDiseaseData,
  getTopDiseasesInIndia,
  type StateDiseaseData 
} from '@/data/india-disease-data';
import { IndiaMapSVG } from './IndiaMapSVG';

interface IndiaDiseaseHeatmapProps {
  className?: string;
}

export function IndiaDiseaseHeatmap({ className = '' }: IndiaDiseaseHeatmapProps) {
  const [selectedState, setSelectedState] = useState<StateDiseaseData | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const getRiskIcon = (level: string) => {
    if (level === 'CRITICAL' || level === 'HIGH') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Activity className="w-4 h-4" />;
  };

  const getRiskBadgeColor = (level: string) => {
    const colors = {
      CRITICAL: 'bg-red-600 text-white',
      HIGH: 'bg-orange-600 text-white',
      MEDIUM: 'bg-yellow-500 text-white',
      LOW: 'bg-green-500 text-white'
    };
    return colors[level as keyof typeof colors] || colors.LOW;
  };

  const topDiseases = getTopDiseasesInIndia(5);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <MapPin className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">India Disease Heatmap</h2>
            <p className="text-sm text-gray-600">
              State-wise disease prevalence and health alerts
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Risk Levels:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-600"></div>
            <span className="text-xs text-gray-600">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-600"></div>
            <span className="text-xs text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-xs text-gray-600">Low</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Interactive India Map
              </h3>
              
              {/* India SVG Map */}
              <IndiaMapSVG onStateClick={setSelectedState} />

              <div className="mt-4 p-3 bg-white rounded-lg">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Click on any state to view detailed disease information. 
                    Data sourced from NCDC, WHO, and state health departments.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            {/* Top Diseases in India */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-red-600" />
                Top Diseases in India
              </h4>
              <div className="space-y-2">
                {topDiseases.map((disease, index) => (
                  <div key={disease.name} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {index + 1}. {disease.name}
                    </span>
                    <span className="text-xs font-semibold text-red-600">
                      {(disease.cases / 1000).toFixed(0)}K
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Critical States */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Critical Alert States
              </h4>
              <div className="space-y-2">
                {INDIA_DISEASE_DATA
                  .filter(s => s.overallRiskLevel === 'CRITICAL')
                  .slice(0, 5)
                  .map((state) => (
                    <button
                      key={state.stateCode}
                      onClick={() => setSelectedState(state)}
                      className="w-full text-left px-3 py-2 bg-white rounded-lg hover:shadow-md transition text-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{state.state}</span>
                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          {state.diseases.length} diseases
                        </span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected State Details */}
        {selectedState && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{selectedState.state}</h3>
                  <p className="text-sm text-gray-600">
                    Population: {(selectedState.population / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getRiskBadgeColor(selectedState.overallRiskLevel)}`}>
                  {getRiskIcon(selectedState.overallRiskLevel)}
                  {selectedState.overallRiskLevel} RISK
                </div>
              </div>

              {/* Disease List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedState.diseases.map((disease, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{disease.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeColor(disease.prevalence)}`}>
                        {disease.prevalence}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{disease.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Reported Cases:</span>
                      <span className="font-semibold text-red-600">
                        {disease.cases.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setSelectedState(null)}
                className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

        {/* All States List */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All States & UTs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {INDIA_DISEASE_DATA.map((state) => (
              <button
                key={state.stateCode}
                onClick={() => setSelectedState(state)}
                className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{state.state}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskBadgeColor(state.overallRiskLevel)}`}>
                    {state.overallRiskLevel}
                  </span>
                </div>
                <div className="text-xs text-gray-600">
                  {state.diseases.length} diseases tracked
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {state.diseases.slice(0, 3).map((disease, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                      {disease.name}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
