'use client';
import React, { useState, useEffect } from 'react';
import BasicHeatmap from './BasicHeatmap';
import FallbackHeatmap from './FallbackHeatmap';

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

export default function HybridHeatmap({ data, regionType }: Props) {
  const [mapMode, setMapMode] = useState<'loading' | 'interactive' | 'fallback'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Test if we can load Leaflet
    const testLeaflet = async () => {
      try {
        console.log('Testing Leaflet availability...');
        const L = await import('leaflet');
        
        // Test if we can create a basic map element
        const testDiv = document.createElement('div');
        testDiv.style.height = '100px';
        testDiv.style.width = '100px';
        testDiv.style.position = 'absolute';
        testDiv.style.left = '-9999px';
        document.body.appendChild(testDiv);
        
        const testMap = L.map(testDiv, { center: [0, 0], zoom: 1 });
        testMap.remove();
        document.body.removeChild(testDiv);
        
        console.log('Leaflet test successful - using interactive map');
        setMapMode('interactive');
      } catch (err) {
        console.error('Leaflet test failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setMapMode('fallback');
      }
    };

    testLeaflet();
  }, []);

  if (mapMode === 'loading') {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing map system...</p>
        </div>
      </div>
    );
  }

  if (mapMode === 'interactive') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Interactive Symptom Heatmap</h3>
          <button
            onClick={() => setMapMode('fallback')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Switch to Grid View
          </button>
        </div>
        <BasicHeatmap data={data} regionType={regionType} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Symptom Data Visualization</h3>
          {error && (
            <p className="text-sm text-red-600">Map unavailable: {error}</p>
          )}
        </div>
        <button
          onClick={() => setMapMode('loading')}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Try Interactive Map
        </button>
      </div>
      <FallbackHeatmap data={data} regionType={regionType} />
    </div>
  );
}