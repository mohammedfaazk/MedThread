'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, Activity } from 'lucide-react';

interface HeatmapCell {
  location: string;
  value: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface DiseaseHeatmapGridProps {
  disease: string;
  selectedCountry: string;
  countriesData: any[];
  statesData: any[];
  className?: string;
}

export function DiseaseHeatmapGrid({ 
  disease, 
  selectedCountry, 
  countriesData, 
  statesData,
  className = '' 
}: DiseaseHeatmapGridProps) {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateHeatmapData();
  }, [disease, selectedCountry, countriesData, statesData]);

  const generateHeatmapData = () => {
    setLoading(true);
    
    try {
      let data: HeatmapCell[] = [];

      // If a country is selected and we have state data, show states
      if (selectedCountry && statesData.length > 0) {
        data = statesData.slice(0, 15).map((state: any) => {
          const value = state.cases || state.active || 0;
          let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          
          // Adjust thresholds based on disease type
          if (disease === 'covid-19' || disease === 'influenza') {
            if (value > 5000000) severity = 'CRITICAL';
            else if (value > 2000000) severity = 'HIGH';
            else if (value > 500000) severity = 'MEDIUM';
            else severity = 'LOW';
          } else {
            if (value > 7000) severity = 'CRITICAL';
            else if (value > 4000) severity = 'HIGH';
            else if (value > 1500) severity = 'MEDIUM';
            else severity = 'LOW';
          }

          return { 
            location: state.state || state.province || state.location, 
            value, 
            severity 
          };
        });
      } 
      // Otherwise show top countries
      else if (countriesData.length > 0) {
        data = countriesData.slice(0, 15).map((country: any) => {
          const value = country.cases || country.active || 0;
          let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
          
          // Adjust thresholds based on disease type
          if (disease === 'covid-19' || disease === 'influenza') {
            if (value > 50000000) severity = 'CRITICAL';
            else if (value > 20000000) severity = 'HIGH';
            else if (value > 5000000) severity = 'MEDIUM';
            else severity = 'LOW';
          } else {
            if (value > 100000) severity = 'CRITICAL';
            else if (value > 50000) severity = 'HIGH';
            else if (value > 10000) severity = 'MEDIUM';
            else severity = 'LOW';
          }

          return { 
            location: country.country, 
            value, 
            severity 
          };
        });
      }

      setHeatmapData(data.sort((a, b) => b.value - a.value));
    } catch (error) {
      console.error('Error generating heatmap data:', error);
      setHeatmapData([]);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-400';
      case 'MEDIUM': return 'bg-yellow-300';
      case 'LOW': return 'bg-green-300';
      default: return 'bg-gray-300';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-white';
      case 'HIGH': return 'text-white';
      case 'MEDIUM': return 'text-gray-900';
      case 'LOW': return 'text-gray-900';
      default: return 'text-gray-700';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="w-4 h-4" />;
      case 'MEDIUM':
        return <Activity className="w-4 h-4" />;
      case 'LOW':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-5 gap-2">
            {[...Array(15)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {disease === 'covid-19' ? 'COVID-19' : 
           disease === 'influenza' ? 'Influenza' :
           disease.charAt(0).toUpperCase() + disease.slice(1)} Cases Heatmap
        </h3>
        <p className="text-sm text-gray-600">
          {selectedCountry && statesData.length > 0
            ? `Showing ${statesData.length} states/provinces in ${selectedCountry}`
            : `Showing top ${Math.min(15, countriesData.length)} countries globally`}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <span className="text-sm font-medium text-gray-700">Severity:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 rounded border border-green-400"></div>
          <span className="text-xs text-gray-600">Low (&lt;1.5K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-300 rounded border border-yellow-400"></div>
          <span className="text-xs text-gray-600">Medium (1.5K-4K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-400 rounded border border-orange-500"></div>
          <span className="text-xs text-gray-600">High (4K-7K)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded border border-red-600"></div>
          <span className="text-xs text-gray-600">Critical (&gt;7K)</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      {heatmapData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {heatmapData.map((cell) => (
            <div
              key={cell.location}
              className={`${getSeverityColor(cell.severity)} ${getSeverityTextColor(cell.severity)} rounded-lg p-4 transition-all hover:scale-105 hover:shadow-lg cursor-pointer`}
              title={`${cell.location}: ${cell.value.toLocaleString()} cases`}
            >
              <div className="flex items-center justify-between mb-2">
                {getSeverityIcon(cell.severity)}
                <span className="text-xs font-semibold opacity-90">{cell.severity}</span>
              </div>
              <div className="font-bold text-lg mb-1">
                {cell.value.toLocaleString()}
              </div>
              <div className="text-xs opacity-90 font-medium truncate">
                {cell.location}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No heatmap data available</p>
          <p className="text-sm text-gray-400 mt-2">
            {selectedCountry 
              ? `Select a different country or clear filters to see data`
              : `Try selecting a disease type to view regional data`}
          </p>
        </div>
      )}

      {/* Summary Stats */}
      {heatmapData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {heatmapData.length}
              </div>
              <div className="text-xs text-gray-600">
                {selectedCountry && statesData.length > 0 ? 'States/Provinces' : 'Countries'} Tracked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {heatmapData.reduce((sum, cell) => sum + cell.value, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {heatmapData.filter(c => c.severity === 'CRITICAL' || c.severity === 'HIGH').length}
              </div>
              <div className="text-xs text-gray-600">High Risk Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {heatmapData.filter(c => c.severity === 'LOW').length}
              </div>
              <div className="text-xs text-gray-600">Low Risk Areas</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
