'use client';
import React, { useState, useEffect } from 'react';
import InteractiveMap from './InteractiveMap';
import SVGMap from './SVGMap';

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

export default function HybridMap({ data, regionType }: Props) {
  const [mapType, setMapType] = useState<'loading' | 'interactive' | 'svg'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    // Test if we can load Leaflet
    const testLeaflet = async () => {
      try {
        console.log('Testing Leaflet availability...');
        
        // Try to import Leaflet
        await import('leaflet');
        
        console.log('Leaflet available - using interactive map');
        setMapType('interactive');
      } catch (err) {
        console.error('Leaflet not available:', err);
        setError('Interactive map unavailable, using SVG fallback');
        setMapType('svg');
      }
    };

    // Add a small delay to prevent flash
    const timer = setTimeout(testLeaflet, 500);
    return () => clearTimeout(timer);
  }, []);

  if (mapType === 'loading') {
    return (
      <div className="h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800 font-medium">Initializing Map System...</p>
          <p className="text-blue-600 text-sm mt-2">Loading interactive components</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Type Switcher */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Symptom Distribution Map</h3>
          {error && (
            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
              ⚠️ {error}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setMapType('interactive')}
            className={`px-3 py-1 text-sm rounded ${
              mapType === 'interactive' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🗺️ Interactive
          </button>
          <button
            onClick={() => setMapType('svg')}
            className={`px-3 py-1 text-sm rounded ${
              mapType === 'svg' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 Simple
          </button>
        </div>
      </div>

      {/* Map Component */}
      {mapType === 'interactive' ? (
        <InteractiveMap data={data} regionType={regionType} />
      ) : (
        <SVGMap data={data} regionType={regionType} />
      )}

      {/* Map Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
        {mapType === 'interactive' ? (
          <p>
            🗺️ <strong>Interactive Map:</strong> Full-featured map with zoom, pan, and detailed popups. 
            Click markers to see symptom details for each region.
          </p>
        ) : (
          <p>
            📊 <strong>Simple Map:</strong> Lightweight SVG-based visualization showing symptom distribution. 
            Hover over markers to see basic information.
          </p>
        )}
      </div>
    </div>
  );
}