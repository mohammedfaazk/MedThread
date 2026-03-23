'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { HeatmapRow } from '@/hooks/useSymptomHeatmap';

interface Props {
  data: HeatmapRow[];
  regionType: string;
  colorScale: 'red' | 'green';
  userLocation?: {lat: number, lng: number, pincode?: string} | null;
}

// Major Indian cities with coordinates
const CITY_COORDS: Record<string, [number, number]> = {
  // Major metros
  'Chennai': [13.0827, 80.2707],
  'New Delhi': [28.6139, 77.2090],
  'Mumbai': [19.0760, 72.8777],
  'Bangalore': [12.9716, 77.5946],
  'Kolkata': [22.5726, 88.3639],
  'Hyderabad': [17.3850, 78.4867],
  
  // Tier 1 cities
  'Pune': [18.5204, 73.8567],
  'Ahmedabad': [23.0225, 72.5714],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Kochi': [9.9312, 76.2673],
  'Coimbatore': [11.0168, 76.9558],
  
  // Tier 2 cities
  'Surat': [21.1702, 72.8311],
  'Nagpur': [21.1458, 79.0882],
  'Indore': [22.7196, 75.8577],
  'Bhopal': [23.2599, 77.4126],
  'Visakhapatnam': [17.7231, 83.3012],
  'Patna': [25.5941, 85.1376],
  'Vadodara': [22.3072, 73.1812],
  'Ludhiana': [30.9010, 75.8573],
  'Agra': [27.1767, 78.0081],
  'Nashik': [19.9975, 73.7898],
  'Faridabad': [28.4089, 77.3178],
  'Meerut': [28.9845, 77.7064],
  'Rajkot': [22.3039, 70.8022],
  'Kalyan-Dombivali': [19.2403, 73.1305],
  'Vasai-Virar': [19.4912, 72.8054],
  'Varanasi': [25.3176, 82.9739],
  'Srinagar': [34.0837, 74.7973],
  'Aurangabad': [19.8762, 75.3433],
  'Dhanbad': [23.7957, 86.4304],
  'Amritsar': [31.6340, 74.8723],
  'Navi Mumbai': [19.0330, 73.0297],
  'Allahabad': [25.4358, 81.8463],
  'Ranchi': [23.3441, 85.3096],
  'Howrah': [22.5958, 88.2636],
  'Coimbatore': [11.0168, 76.9558],
  'Jabalpur': [23.1815, 79.9864],
  'Gwalior': [26.2183, 78.1828],
  'Vijayawada': [16.5062, 80.6480],
  'Jodhpur': [26.2389, 73.0243],
  'Madurai': [9.9252, 78.1198],
  'Raipur': [21.2514, 81.6296],
  'Kota': [25.2138, 75.8648],
  'Guwahati': [26.1445, 91.7362],
  'Chandigarh': [30.7333, 76.7794],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Solapur': [17.6599, 75.9064],
  'Hubballi-Dharwad': [15.3647, 75.1240],
  'Tiruchirappalli': [10.7905, 78.7047],
  'Bareilly': [28.3670, 79.4304],
  'Mysore': [12.2958, 76.6394],
  'Tiruppur': [11.1085, 77.3411],
  'Gurgaon': [28.4595, 77.0266],
  'Aligarh': [27.8974, 78.0880],
  'Jalandhar': [31.3260, 75.5762],
  'Bhubaneswar': [20.2961, 85.8245],
  'Salem': [11.6643, 78.1460],
  'Warangal': [17.9689, 79.5941],
  'Mira-Bhayandar': [19.2952, 72.8544],
  'Jalgaon': [21.0077, 75.5626],
  'Guntur': [16.3067, 80.4365],
  'Bhiwandi': [19.3002, 73.0635],
  'Saharanpur': [29.9680, 77.5552],
  'Gorakhpur': [26.7606, 83.3732],
  'Bikaner': [28.0229, 73.3119],
  'Amravati': [20.9374, 77.7796],
  'Noida': [28.5355, 77.3910],
  'Jamshedpur': [22.8046, 86.2029],
  'Bhilai Nagar': [21.1938, 81.3509],
  'Cuttack': [20.4625, 85.8828],
  'Firozabad': [27.1592, 78.3957],
  'Kochi': [9.9312, 76.2673],
  'Bhavnagar': [21.7645, 72.1519],
  'Dehradun': [30.3165, 78.0322],
  'Durgapur': [23.4820, 87.3119],
  'Asansol': [23.6739, 86.9524],
  'Nanded-Waghala': [19.1383, 77.2975],
  'Kolhapur': [16.7050, 74.2433],
  'Ajmer': [26.4499, 74.6399],
  'Akola': [20.7002, 77.0082],
  'Gulbarga': [17.3297, 76.8343],
  'Jamnagar': [22.4707, 70.0577],
  'Ujjain': [23.1765, 75.7885],
  'Loni': [28.7333, 77.2833],
  'Siliguri': [26.7271, 88.3953],
  'Jhansi': [25.4484, 78.5685],
  'Ulhasnagar': [19.2215, 73.1645],
  'Jammu': [32.7266, 74.8570],
  'Sangli-Miraj & Kupwad': [16.8524, 74.5815],
  'Mangalore': [12.9141, 74.8560],
  'Erode': [11.3410, 77.7172],
  'Belgaum': [15.8497, 74.4977],
  'Ambattur': [13.1143, 80.1548],
  'Tirunelveli': [8.7139, 77.7567],
  'Malegaon': [20.5579, 74.5287],
  'Gaya': [24.7914, 85.0002],
  'Jalgaon': [21.0077, 75.5626],
  'Udaipur': [24.5854, 73.7125],
  'Maheshtala': [22.4978, 88.2476]
};

const PINCODE_COORDS: Record<string, [number, number]> = {
  // Tamil Nadu
  '600026': [13.0827, 80.2707], // Chennai
  '600094': [13.0827, 80.2707], // Chennai
  '600001': [13.0827, 80.2707], // Chennai
  '600028': [13.0827, 80.2707], // Chennai
  '641001': [11.0168, 76.9558], // Coimbatore
  '620001': [10.7905, 78.7047], // Tiruchirappalli
  '625001': [9.9252, 78.1198],  // Madurai
  
  // Delhi
  '110001': [28.6139, 77.2090], // New Delhi
  '110002': [28.6139, 77.2090], // New Delhi
  '110016': [28.5355, 77.2910], // South Delhi
  '110025': [28.6692, 77.2265], // East Delhi
  '110034': [28.7041, 77.1025], // North Delhi
  
  // Maharashtra
  '400001': [19.0760, 72.8777], // Mumbai
  '400002': [19.0760, 72.8777], // Mumbai
  '400050': [19.0896, 72.8656], // Mumbai Suburban
  '411001': [18.5204, 73.8567], // Pune
  '411014': [18.5204, 73.8567], // Pune
  '440001': [21.1458, 79.0882], // Nagpur
  
  // Karnataka
  '560001': [12.9716, 77.5946], // Bangalore
  '560002': [12.9716, 77.5946], // Bangalore
  '560025': [12.9716, 77.5946], // Bangalore
  '575001': [12.9141, 74.8560], // Mangalore
  '580001': [15.3647, 75.1240], // Hubli
  
  // West Bengal
  '700001': [22.5726, 88.3639], // Kolkata
  '700016': [22.5726, 88.3639], // Kolkata
  '700091': [22.6868, 88.3643], // North 24 Parganas
  
  // Telangana
  '500001': [17.3850, 78.4867], // Hyderabad
  '500003': [17.3850, 78.4867], // Hyderabad
  '500016': [17.3850, 78.4867], // Hyderabad
  
  // Gujarat
  '380001': [23.0225, 72.5714], // Ahmedabad
  '380015': [23.0225, 72.5714], // Ahmedabad
  '395001': [21.1702, 72.8311], // Surat
  
  // Rajasthan
  '302001': [26.9124, 75.7873], // Jaipur
  '302006': [26.9124, 75.7873], // Jaipur
  '342001': [26.2389, 73.0243], // Jodhpur
  
  // Uttar Pradesh
  '226001': [26.8467, 80.9462], // Lucknow
  '208001': [26.4499, 80.3319], // Kanpur
  '282001': [27.1767, 78.0081], // Agra
  '221001': [25.3176, 82.9739], // Varanasi
  
  // Punjab
  '160001': [30.7333, 76.7794], // Chandigarh
  '141001': [30.9010, 75.8573], // Ludhiana
  '143001': [31.6340, 74.8723], // Amritsar
  
  // Haryana
  '122001': [28.4595, 77.0266], // Gurgaon
  '134001': [30.3752, 76.7821], // Ambala
  
  // Kerala
  '682001': [9.9312, 76.2673],  // Kochi
  '695001': [8.5241, 76.9366],  // Thiruvananthapuram
  '673001': [11.2588, 75.7804], // Kozhikode
  
  // Andhra Pradesh
  '530001': [17.7231, 83.3012], // Visakhapatnam
  '520001': [16.5062, 80.6480], // Vijayawada
  
  // Odisha
  '751001': [20.2961, 85.8245], // Bhubaneswar
  
  // Madhya Pradesh
  '462001': [23.2599, 77.4126], // Bhopal
  '452001': [22.7196, 75.8577], // Indore
  
  // Chhattisgarh
  '492001': [21.2514, 81.6296], // Raipur
  
  // Jharkhand
  '834001': [23.3441, 85.3096], // Ranchi
  
  // Bihar
  '800001': [25.5941, 85.1376], // Patna
  
  // Assam
  '781001': [26.1445, 91.7362], // Guwahati
};

function getColor(caseCount: number, colorScale: 'red' | 'green'): string {
  if (caseCount === 0) return '#e5e7eb';
  
  const colors = colorScale === 'red' 
    ? ['#fef2f2', '#fecaca', '#f87171', '#ef4444', '#dc2626', '#b91c1c', '#7f1d1d']
    : ['#f0fdf4', '#bbf7d0', '#86efac', '#4ade80', '#16a34a', '#15803d', '#14532d'];
  
  if (caseCount <= 2) return colors[1];
  if (caseCount <= 4) return colors[2];
  if (caseCount <= 6) return colors[3];
  if (caseCount <= 8) return colors[4];
  if (caseCount <= 12) return colors[5];
  return colors[6];
}

export default function SimpleHeatmap({ data, regionType, colorScale, userLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Process data into regions with totals - moved before console.log
  const regionData = React.useMemo(() => {
    const regions: Record<string, { total: number; symptoms: string[]; coords?: [number, number] }> = {};
    
    data.forEach(item => {
      if (!regions[item.regionName]) {
        regions[item.regionName] = { total: 0, symptoms: [] };
        
        // Add coordinates based on region type
        if (regionType === 'pincode' && PINCODE_COORDS[item.regionName]) {
          regions[item.regionName].coords = PINCODE_COORDS[item.regionName];
        } else if (regionType === 'city' && CITY_COORDS[item.regionName]) {
          regions[item.regionName].coords = CITY_COORDS[item.regionName];
        }
      }
      
      regions[item.regionName].total += item.caseCount;
      if (!regions[item.regionName].symptoms.includes(item.symptomTag)) {
        regions[item.regionName].symptoms.push(item.symptomTag);
      }
    });
    
    return regions;
  }, [data, regionType]);

  console.log('SimpleHeatmap render:', { dataLength: data.length, regionType });
  console.log('Region data processed:', regionData);

  // Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const initMap = async () => {
      try {
        console.log('Initializing map...');
        
        // Import Leaflet CSS first
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const leafletCSS = document.createElement('link');
          leafletCSS.rel = 'stylesheet';
          leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          leafletCSS.crossOrigin = '';
          document.head.appendChild(leafletCSS);
          
          // Wait for CSS to load
          await new Promise((resolve) => {
            leafletCSS.onload = resolve;
            leafletCSS.onerror = resolve; // Continue even if CSS fails
            setTimeout(resolve, 2000); // Timeout after 2 seconds
          });
        }
        
        const L = await import('leaflet');
        console.log('Leaflet loaded successfully');
        
        // Fix Leaflet default icons issue in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        // Clean up existing map
        if (mapInstance.current) {
          console.log('Cleaning up existing map');
          mapInstance.current.remove();
        }

        console.log('Creating new map instance');
        // Create new map with user location if available
        const mapCenter: [number, number] = userLocation 
          ? [userLocation.lat, userLocation.lng] 
          : [20.5937, 78.9629]; // Center of India
        
        mapInstance.current = L.map(mapRef.current, {
          center: mapCenter,
          zoom: regionType === 'pincode' || regionType === 'city' ? 6 : 5,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        console.log('Adding base tile layer');
        // Add base map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          opacity: 0.7
        }).addTo(mapInstance.current);

        console.log('Map initialized successfully');
        setIsLoading(false);

      } catch (error) {
        console.error('Failed to initialize map:', error);
        setError('Failed to load map. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [regionType]);

  // Add markers and regions
  useEffect(() => {
    if (!mapInstance.current || isLoading) return;

    const addMarkersAndRegions = async () => {
      try {
        const L = await import('leaflet');

        // Clear existing layers except base tile layer
        mapInstance.current.eachLayer((layer: any) => {
          if (layer instanceof L.CircleMarker || layer instanceof L.GeoJSON || layer instanceof L.Marker) {
            mapInstance.current.removeLayer(layer);
          }
        });

        console.log(`Processing ${Object.keys(regionData).length} regions for ${regionType} view`);

        if (regionType === 'state') {
          // Load and display state boundaries
          try {
            console.log('Loading state boundaries...');
            const response = await fetch('/maps/india-states.geojson');
            if (response.ok) {
              const geoData = await response.json();
              console.log('GeoJSON loaded, features:', geoData.features?.length);
              
              const geoLayer = L.geoJSON(geoData, {
                style: (feature: any) => {
                  const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || '';
                  const regionInfo = regionData[stateName];
                  const caseCount = regionInfo?.total || 0;
                  
                  console.log(`State: ${stateName}, Cases: ${caseCount}`);
                  
                  return {
                    fillColor: getColor(caseCount, colorScale),
                    fillOpacity: caseCount > 0 ? 0.8 : 0.2,
                    color: caseCount > 0 ? '#333333' : '#cccccc',
                    weight: caseCount > 0 ? 3 : 1,
                    opacity: 1
                  };
                },
                onEachFeature: (feature: any, layer: any) => {
                  const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || '';
                  const regionInfo = regionData[stateName];
                  
                  if (regionInfo && regionInfo.total > 0) {
                    layer.bindPopup(`
                      <div class="p-3">
                        <h3 class="font-bold text-lg">${stateName}</h3>
                        <p class="text-sm">Total Cases: <strong class="text-red-600">${regionInfo.total}</strong></p>
                        <p class="text-sm">Symptoms: <span class="text-blue-600">${regionInfo.symptoms.join(', ')}</span></p>
                      </div>
                    `);
                    
                    layer.on('mouseover', function() {
                      this.setStyle({ weight: 5, color: '#ff0000' });
                    });
                    
                    layer.on('mouseout', function() {
                      this.setStyle({ weight: 3, color: '#333333' });
                    });
                  } else {
                    layer.bindPopup(`
                      <div class="p-3">
                        <h3 class="font-bold">${stateName}</h3>
                        <p class="text-sm text-gray-500">No symptom data available</p>
                      </div>
                    `);
                  }
                }
              });
              
              geoLayer.addTo(mapInstance.current);
              console.log('State boundaries added successfully');
            } else {
              console.error('Failed to fetch GeoJSON:', response.status);
            }
          } catch (error) {
            console.error('Failed to load state boundaries:', error);
          }
        } else {
          // Add circle markers for city/pincode data
          let markersAdded = 0;
          Object.entries(regionData).forEach(([regionName, info]) => {
            if (info.coords && info.total > 0) {
              const radius = Math.max(10, Math.min(50, info.total * 3));
              const color = getColor(info.total, colorScale);
              
              console.log(`Adding marker for ${regionName}: ${info.total} cases at ${info.coords}`);
              
              const marker = L.circleMarker(info.coords, {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 3,
                opacity: 1,
                fillOpacity: 0.8
              });
              
              marker.bindPopup(`
                <div class="p-3">
                  <h3 class="font-bold text-lg">${regionName}</h3>
                  <p class="text-sm">Cases: <strong class="text-red-600">${info.total}</strong></p>
                  <p class="text-sm">Symptoms: <span class="text-blue-600">${info.symptoms.join(', ')}</span></p>
                </div>
              `);
              
              marker.addTo(mapInstance.current);
              markersAdded++;
            }
          });
          
          console.log(`Added ${markersAdded} markers for ${regionType} data`);
          
          // Add user location marker if available
          if (userLocation) {
            console.log('Adding user location marker');
            const userMarker = L.marker([userLocation.lat, userLocation.lng], {
              icon: L.icon({
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            });
            
            userMarker.bindPopup(`
              <div class="p-3">
                <h3 class="font-bold text-lg">📍 Your Location</h3>
                <p class="text-sm">Lat: ${userLocation.lat.toFixed(4)}</p>
                <p class="text-sm">Lng: ${userLocation.lng.toFixed(4)}</p>
              </div>
            `);
            
            userMarker.addTo(mapInstance.current);
          }
          
          // If no markers were added, show a message
          if (markersAdded === 0) {
            console.log('No markers added - no coordinate data available');
          }
        }

      } catch (error) {
        console.error('Failed to add markers/regions:', error);
      }
    };

    addMarkersAndRegions();
  }, [regionData, regionType, colorScale, isLoading]);

  return (
    <div className="relative">
      <div ref={mapRef} style={{ height: 500, width: '100%' }} className="rounded-lg border" />
      
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-red-50 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg p-3 shadow-lg border z-20">
        <h4 className="text-sm font-semibold mb-2">Case Count</h4>
        <div className="flex flex-wrap gap-2">
          {[0, 2, 4, 6, 8, 12].map((count, i) => (
            <div key={count} className="flex items-center gap-1">
              <div 
                className="w-4 h-4 rounded border"
                style={{ backgroundColor: getColor(count, colorScale) }}
              />
              <span className="text-xs">{count === 0 ? '0' : count === 12 ? '12+' : `${count}`}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-lg border z-20">
        <p className="text-sm font-medium">
          {regionType === 'state' ? 'Colored regions' : 'Circle markers'} show symptom data
        </p>
        <p className="text-xs text-gray-600 mt-1">
          {Object.keys(regionData).length} regions with data
        </p>
      </div>

      {/* Fallback: Simple grid visualization if map fails */}
      {error && (
        <div className="mt-4 p-4 bg-white rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Symptom Data Overview</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(regionData)
              .filter(([_, info]) => info.total > 0)
              .sort(([,a], [,b]) => b.total - a.total)
              .map(([regionName, info]) => (
                <div 
                  key={regionName}
                  className="p-3 rounded-lg border-2"
                  style={{ 
                    backgroundColor: getColor(info.total, colorScale),
                    borderColor: info.total > 8 ? '#dc2626' : info.total > 4 ? '#f59e0b' : '#10b981'
                  }}
                >
                  <h4 className="font-semibold text-sm">{regionName}</h4>
                  <p className="text-xs">Cases: {info.total}</p>
                  <p className="text-xs">Symptoms: {info.symptoms.slice(0, 2).join(', ')}</p>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}