'use client';
import { useState, useEffect } from 'react';

export default function TestMapPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testLeaflet = async () => {
      try {
        console.log('Testing Leaflet import...');
        const L = await import('leaflet');
        console.log('Leaflet imported successfully:', !!L);
        
        // Test if we can create a basic map
        const mapDiv = document.createElement('div');
        mapDiv.style.height = '200px';
        mapDiv.style.width = '200px';
        document.body.appendChild(mapDiv);
        
        const testMap = L.map(mapDiv, {
          center: [20, 78],
          zoom: 4
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(testMap);
        
        console.log('Test map created successfully');
        setMapLoaded(true);
        
        // Clean up
        setTimeout(() => {
          testMap.remove();
          document.body.removeChild(mapDiv);
        }, 1000);
        
      } catch (err) {
        console.error('Leaflet test failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    testLeaflet();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Map Test Page</h1>
      
      <div className="bg-white p-4 rounded border mb-4">
        <h2 className="text-lg font-semibold mb-2">Leaflet Test Results</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={mapLoaded ? 'text-green-600' : 'text-gray-400'}>
              {mapLoaded ? '✅' : '⏳'}
            </span>
            <span>Leaflet Map Creation</span>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">
              Error: {error}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <h2 className="text-lg font-semibold mb-2">API Test</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('http://localhost:3001/api/analytics/symptom-heatmap?region_type=state&days=30');
              const data = await response.json();
              console.log('API Response:', data);
              alert(`API working! Got ${data.data?.length || 0} records`);
            } catch (err) {
              console.error('API test failed:', err);
              alert('API test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test API
        </button>
      </div>
    </div>
  );
}