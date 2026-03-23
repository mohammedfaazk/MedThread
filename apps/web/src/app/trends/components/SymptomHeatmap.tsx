'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { HeatmapRow } from '@/hooks/useSymptomHeatmap';

interface Props {
  data:         HeatmapRow[];
  activeSym:    string;
  activeState:  string;
  colorScale:   'red' | 'green';
  onStateClick: (state: string) => void;
  regionType:   string;
}

const RED   = ['#fff7ed','#fed7aa','#fdba74','#f97316','#ea580c','#dc2626','#b91c1c','#7f1d1d'];
const GREEN = ['#f0fdf4','#bbf7d0','#86efac','#4ade80','#16a34a','#15803d','#166534','#14532d'];
const LABS  = ['0','1-5','5-10','10-20','20-50','50-100','100+'];

function getColor(c: number, sc: 'red' | 'green') {
  const A = sc === 'green' ? GREEN : RED;
  if (!c) return '#e5e7eb';
  if (c <= 1) return A[1];
  if (c <= 5) return A[2]; 
  if (c <= 10) return A[3];
  if (c <= 20) return A[4]; 
  if (c <= 50) return A[5]; 
  if (c <= 100) return A[6];
  return A[7];
}

// Comprehensive pincode to coordinates mapping for major Indian cities
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
  '110016': [28.5355, 77.2490], // South Delhi
  '110025': [28.6692, 77.2265], // East Delhi
  '110034': [28.7041, 77.1025], // North Delhi
  
  // Maharashtra
  '400001': [18.9220, 72.8347], // Mumbai
  '400002': [18.9220, 72.8347], // Mumbai
  '400050': [19.0330, 72.8397], // Mumbai Suburban
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
  '700091': [22.6708, 88.3832], // North 24 Parganas
  
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
  '530001': [17.6868, 83.2185], // Visakhapatnam
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

export default function SymptomHeatmap({ data, activeSym, activeState, colorScale, onStateClick, regionType }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerRef    = useRef<any>(null);
  const markersRef  = useRef<any[]>([]);
  const [tooltip, setTooltip]       = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  console.log('SymptomHeatmap render:', { dataLength: data.length, regionType, activeState });

  // Process data based on region type
  const processedData = React.useMemo(() => {
    const regionMap: Record<string, { total: number; symptoms: Record<string, number>; alert: string; coords?: [number, number] }> = {};
    
    data.forEach(r => {
      if (!regionMap[r.regionName]) {
        regionMap[r.regionName] = { total: 0, symptoms: {}, alert: 'none' };
        
        // Add coordinates for pincode data
        if (regionType === 'pincode' && PINCODE_COORDS[r.regionName]) {
          regionMap[r.regionName].coords = PINCODE_COORDS[r.regionName];
        }
      }
      
      regionMap[r.regionName].total += r.caseCount;
      regionMap[r.regionName].symptoms[r.symptomTag] = (regionMap[r.regionName].symptoms[r.symptomTag] || 0) + r.caseCount;
      if (r.alertLevel !== 'none') regionMap[r.regionName].alert = r.alertLevel;
    });
    
    return regionMap;
  }, [data, regionType]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // Clean up existing map
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }
    
    import('leaflet').then(L => {
      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          center: [20.5937, 78.9629],
          zoom: regionType === 'pincode' || regionType === 'city' ? 6 : 4.5,
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: true,
          doubleClickZoom: true,
        });
        
        // Add base tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          opacity: 0.4
        }).addTo(mapInstance.current);
      }
    }).catch(error => {
      console.error('Error importing Leaflet:', error);
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [regionType]);

  // Update map data and visualization
  useEffect(() => {
    if (!mapInstance.current) return;
    
    import('leaflet').then(async L => {
      // Clear existing layers
      if (layerRef.current) {
        mapInstance.current.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      
      // Clear existing markers
      markersRef.current.forEach(marker => {
        mapInstance.current.removeLayer(marker);
      });
      markersRef.current = [];

      try {
        if (regionType === 'state' || regionType === 'country') {
          // Load and display state boundaries with colors
          const res = await fetch('/maps/india-states.geojson');
          if (!res.ok) throw new Error(`Failed to fetch GeoJSON: ${res.status}`);
          
          const geo = await res.json();
          
          layerRef.current = L.geoJSON(geo, {
            style: (feature: any) => {
              const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || '';
              const info = processedData[stateName];
              const symOk = !activeSym || (info?.symptoms[activeSym] > 0);
              const stOk = !activeState || stateName === activeState;
              
              return {
                fillColor: getColor(info?.total || 0, colorScale),
                fillOpacity: symOk && stOk ? 0.8 : 0.2,
                color: info?.total > 0 ? '#ffffff' : '#cccccc',
                weight: info?.total > 0 ? 2 : 1,
              };
            },
            onEachFeature: (feature: any, layer: any) => {
              const stateName = feature.properties.ST_NM || feature.properties.NAME_1 || '';
              const info = processedData[stateName];
              
              layer.on({
                mouseover: (e: any) => {
                  if (info?.total > 0) {
                    const rect = mapRef.current!.getBoundingClientRect();
                    setTooltipPos({ 
                      x: e.originalEvent.clientX - rect.left + 14, 
                      y: e.originalEvent.clientY - rect.top - 10 
                    });
                    setTooltip({
                      name: stateName,
                      cases: info.total,
                      symptoms: Object.entries(info.symptoms).sort((a, b) => b[1] - a[1]).slice(0, 3),
                      alert: info.alert
                    });
                  }
                },
                mouseout: () => setTooltip(null),
                click: () => {
                  if (info?.total > 0) {
                    onStateClick(stateName === activeState ? '' : stateName);
                    // Zoom to state
                    mapInstance.current.fitBounds(layer.getBounds(), { padding: [20, 20] });
                  }
                }
              });
            }
          }).addTo(mapInstance.current);
          
        } else if (regionType === 'pincode' || regionType === 'city' || regionType === 'district') {
          // Display point markers for pincode/city/district data
          Object.entries(processedData).forEach(([regionName, info]) => {
            let coords: [number, number] | null = null;
            
            if (regionType === 'pincode' && info.coords) {
              coords = info.coords;
            } else if (regionType === 'city') {
              // For cities, try to find coordinates (simplified mapping)
              const cityCoords: Record<string, [number, number]> = {
                'Chennai': [13.0827, 80.2707],
                'Delhi': [28.6139, 77.2090],
                'Mumbai': [19.0760, 72.8777],
                'Bangalore': [12.9716, 77.5946],
                'Kolkata': [22.5726, 88.3639],
                'Hyderabad': [17.3850, 78.4867],
                'Pune': [18.5204, 73.8567],
              };
              coords = cityCoords[regionName] || null;
            }
            
            if (coords && info.total > 0) {
              const radius = Math.max(8, Math.min(50, info.total * 3));
              const color = getColor(info.total, colorScale);
              
              const marker = L.circleMarker(coords, {
                radius: radius,
                fillColor: color,
                color: '#ffffff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
              });
              
              marker.on({
                mouseover: (e: any) => {
                  const rect = mapRef.current!.getBoundingClientRect();
                  setTooltipPos({ 
                    x: e.originalEvent.clientX - rect.left + 14, 
                    y: e.originalEvent.clientY - rect.top - 10 
                  });
                  setTooltip({
                    name: regionName,
                    cases: info.total,
                    symptoms: Object.entries(info.symptoms).sort((a, b) => b[1] - a[1]).slice(0, 3),
                    alert: info.alert
                  });
                },
                mouseout: () => setTooltip(null),
                click: () => {
                  onStateClick(regionName === activeState ? '' : regionName);
                  mapInstance.current.setView(coords, Math.max(mapInstance.current.getZoom(), 8));
                }
              });
              
              marker.addTo(mapInstance.current);
              markersRef.current.push(marker);
            }
          });
          
          // Adjust map view to show all markers
          if (markersRef.current.length > 0) {
            const group = new L.featureGroup(markersRef.current);
            mapInstance.current.fitBounds(group.getBounds(), { padding: [20, 20] });
          }
        }
        
      } catch (error) {
        console.error('Failed to load map data:', error);
      }
    });
  }, [data, activeSym, activeState, colorScale, regionType, processedData]);

  return (
    <div className="relative rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
      <div ref={mapRef} style={{ height: 480, width: '100%' }} />

      {tooltip && (
        <div
          className="absolute z-[1000] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs pointer-events-none min-w-[160px] shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <p className="font-medium text-sm text-gray-900 mb-1">{tooltip.name}</p>
          <p className="text-gray-500">Cases: <strong className="text-gray-800">{tooltip.cases.toLocaleString()}</strong></p>
          <p className="text-gray-500 mt-0.5">
            Level: <span className={`font-medium ${
              tooltip.cases >= 5 ? 'text-red-600' : 
              tooltip.cases >= 3 ? 'text-orange-500' : 
              'text-yellow-500'
            }`}>
              {tooltip.cases >= 5 ? '🔴 High' : tooltip.cases >= 3 ? '🟡 Medium' : '🟢 Low'}
            </span>
          </p>
          {tooltip.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tooltip.symptoms.map(([symptom, count]: [string, number]) => (
                <span key={symptom} className="bg-blue-50 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                  {symptom}: {count}
                </span>
              ))}
            </div>
          )}
          {tooltip.alert !== 'none' && (
            <p className="text-red-500 font-semibold mt-1.5 text-[10px] uppercase tracking-wide">
              🚨 {tooltip.alert === 'outbreak' ? 'Outbreak Alert' : tooltip.alert === 'epidemic' ? 'Epidemic Alert' : 'Watch Alert'}
            </p>
          )}
        </div>
      )}

      <div className="absolute bottom-3 left-3 z-[999] bg-white/95 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
        <p className="text-xs font-medium text-gray-700 mb-1">Case Count Legend</p>
        <div className="flex flex-wrap gap-2">
          {LABS.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm border border-gray-300"
                style={{ background: i === 0 ? '#e5e7eb' : (colorScale === 'green' ? GREEN[i] : RED[i]) }} />
              <span className="text-[10px] text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[999] bg-white/95 rounded-lg px-3 py-2 border border-gray-200 shadow-sm">
        <p className="text-xs font-medium text-gray-700">
          {regionType === 'pincode' || regionType === 'city' ? 'Circle size = case count' : 'Color intensity = case count'}
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          Click regions to zoom • Hover for details
        </p>
      </div>
    </div>
  );
}