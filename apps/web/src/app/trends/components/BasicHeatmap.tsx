'use client';
import React, { useEffect, useRef, useState } from 'react';

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

export default function BasicHeatmap({ data, regionType }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        console.log('Starting map initialization...');
        setMapStatus('loading');

        // Load Leaflet dynamically
        const L = await import('leaflet');
        console.log('Leaflet loaded');

        if (!mounted) return;

        // Create map
        const map = L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        console.log('Base map created successfully');

        // Add some test markers based on data
        const regionCounts: Record<string, number> = {};
        data.forEach(item => {
          regionCounts[item.regionName] = (regionCounts[item.regionName] || 0) + item.caseCount;
        });

        // Simple coordinates for major states/cities
        const coordinates: Record<string, [number, number]> = {
          'Tamil Nadu': [11.1271, 78.6569],
          'Delhi': [28.7041, 77.1025],
          'Maharashtra': [19.7515, 75.7139],
          'Karnataka': [15.3173, 75.7139],
          'West Bengal': [22.9868, 87.8550],
          'Gujarat': [23.0225, 72.5714],
          'Rajasthan': [27.0238, 74.2179],
          'Uttar Pradesh': [26.8467, 80.9462],
          'Kerala': [10.8505, 76.2711],
          'Telangana': [18.1124, 79.0193],
        };

        Object.entries(regionCounts).forEach(([regionName, count]) => {
          const coords = coordinates[regionName];
          if (coords && count > 0) {
            const marker = L.circleMarker(coords, {
              radius: Math.max(5, Math.min(20, count)),
              fillColor: count > 10 ? '#dc2626' : count > 5 ? '#f59e0b' : '#10b981',
              color: '#ffffff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            });

            marker.bindPopup(`
              <div>
                <h3><strong>${regionName}</strong></h3>
                <p>Total Cases: ${count}</p>
              </div>
            `);

            marker.addTo(map);
          }
        });

        console.log(`Added markers for ${Object.keys(regionCounts).length} regions`);
        setMapStatus('ready');

        // Cleanup function
        return () => {
          map.remove();
        };

      } catch (error) {
        console.error('Map initialization failed:', error);
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
          setMapStatus('error');
        }
      }
    };

    initializeMap();

    return () => {
      mounted = false;
    };
  }, [data, regionType]);

  if (mapStatus === 'loading') {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mapStatus === 'error') {
    return (
      <div className="h-96 bg-red-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load map</p>
          <p className="text-sm text-gray-600">{errorMessage}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="h-96 w-full rounded-lg border" />
      
      {/* Simple legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 rounded p-2 shadow text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Low (1-5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Medium (6-10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>High (11+)</span>
        </div>
      </div>
    </div>
  );
}