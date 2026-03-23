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

export default function InteractiveMap({ data, regionType }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState('');

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

  // State coordinates for India
  const stateCoordinates: Record<string, [number, number]> = {
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
    'Andhra Pradesh': [15.9129, 79.7400],
    'Madhya Pradesh': [22.9734, 78.6569],
    'Bihar': [25.0961, 85.3131],
    'Odisha': [20.9517, 85.0985],
    'Punjab': [31.1471, 75.3412],
    'Haryana': [29.0588, 76.0856],
    'Assam': [26.2006, 92.9376],
    'Jharkhand': [23.6102, 85.2799],
    'Himachal Pradesh': [31.1048, 77.1734],
    'Uttarakhand': [30.0668, 79.0193],
    'Chhattisgarh': [21.2787, 81.8661],
    'Goa': [15.2993, 74.1240],
    'Tripura': [23.9408, 91.9882],
    'Manipur': [24.6637, 93.9063],
    'Meghalaya': [25.4670, 91.3662],
    'Sikkim': [27.5330, 88.5122],
    'Arunachal Pradesh': [28.2180, 94.7278],
    'Nagaland': [26.1584, 94.5624],
    'Mizoram': [23.1645, 92.9376]
  };

  const getColor = (caseCount: number): string => {
    if (caseCount === 0) return '#e5e7eb';
    if (caseCount <= 5) return '#10b981';
    if (caseCount <= 10) return '#f59e0b';
    if (caseCount <= 20) return '#ef4444';
    return '#dc2626';
  };

  useEffect(() => {
    let mounted = true;

    const initializeMap = async () => {
      if (!mapRef.current) return;

      try {
        console.log('Loading Leaflet...');
        
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          
          // Wait for CSS to load
          await new Promise(resolve => {
            link.onload = resolve;
            setTimeout(resolve, 2000); // Fallback timeout
          });
        }

        // Dynamic import of Leaflet
        const L = await import('leaflet');
        
        if (!mounted) return;

        console.log('Creating map...');

        // Fix default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        // Clean up existing map
        if (mapInstance.current) {
          mapInstance.current.remove();
        }

        // Create map
        mapInstance.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(mapInstance.current);

        console.log('Map created, adding markers...');

        // Add markers for regions with data
        Object.entries(regionData).forEach(([regionName, info]) => {
          const coords = stateCoordinates[regionName];
          if (coords && info.total > 0) {
            const color = getColor(info.total);
            const radius = Math.max(10, Math.min(50, info.total * 2));

            // Create circle marker
            const circle = L.circleMarker(coords, {
              radius: radius,
              fillColor: color,
              color: '#ffffff',
              weight: 3,
              opacity: 1,
              fillOpacity: 0.8
            });

            // Add popup
            circle.bindPopup(`
              <div style="padding: 8px;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${regionName}</h3>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Total Cases:</strong> ${info.total}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Symptoms:</strong></p>
                <div style="font-size: 12px;">
                  ${info.symptoms.slice(0, 5).map(s => `<span style="background: rgba(0,0,0,0.1); padding: 2px 6px; margin: 2px; border-radius: 4px; display: inline-block;">${s}</span>`).join('')}
                  ${info.symptoms.length > 5 ? `<br><small>+${info.symptoms.length - 5} more symptoms</small>` : ''}
                </div>
              </div>
            `);

            // Add hover effects
            circle.on('mouseover', function() {
              this.setStyle({ weight: 5, color: '#000000' });
            });

            circle.on('mouseout', function() {
              this.setStyle({ weight: 3, color: '#ffffff' });
            });

            circle.addTo(mapInstance.current);
          }
        });

        console.log('Map initialization complete');
        setMapReady(true);

      } catch (err) {
        console.error('Map initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      }
    };

    initializeMap();

    return () => {
      mounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [regionData, regionType]);

  if (error) {
    return (
      <div className="h-96 bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-red-600 font-medium mb-2">Map Loading Failed</p>
          <p className="text-sm text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg border-2 border-gray-300"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-blue-50 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-800 font-medium">Loading Interactive Map...</p>
            <p className="text-blue-600 text-sm mt-2">Please wait while we load the map tiles and data</p>
          </div>
        </div>
      )}

      {/* Legend */}
      {mapReady && (
        <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg border z-20">
          <h4 className="text-sm font-semibold mb-2">Case Count Legend</h4>
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
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Panel */}
      {mapReady && (
        <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg border z-20">
          <p className="text-sm font-medium">🗺️ Interactive Symptom Map</p>
          <p className="text-xs text-gray-600 mt-1">
            {Object.keys(regionData).length} regions with symptom data
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Click markers for details • Zoom and pan to explore
          </p>
        </div>
      )}
    </div>
  );
}