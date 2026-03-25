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
  const geoJsonLayerRef = useRef<any>(null);

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

  // Get coordinates based on region type
  const getRegionCoordinates = (regionName: string): [number, number] | null => {
    // First check state coordinates
    if (stateCoordinates[regionName]) {
      return stateCoordinates[regionName];
    }

    // District and city coordinates
    const locationCoordinates: Record<string, [number, number]> = {
      // Tamil Nadu Districts
      'Chennai': [13.0827, 80.2707],
      'Coimbatore': [11.0168, 76.9558],
      'Madurai': [9.9252, 78.1198],
      'Tiruchirappalli': [10.7905, 78.7047],
      'Salem': [11.6643, 78.1460],
      'Tirunelveli': [8.7139, 77.7567],
      'Erode': [11.3410, 77.7172],
      'Vellore': [12.9165, 79.1325],
      'Thoothukudi': [8.7642, 78.1348],
      'Thanjavur': [10.7870, 79.1378],
      'Dindigul': [10.3673, 77.9803],
      'Kanchipuram': [12.8342, 79.7036],
      
      // Delhi Districts
      'Central Delhi': [28.6519, 77.2315],
      'North Delhi': [28.7041, 77.1025],
      'South Delhi': [28.5355, 77.2490],
      'East Delhi': [28.6692, 77.2265],
      'West Delhi': [28.6517, 77.1048],
      'New Delhi': [28.6139, 77.2090],
      
      // Maharashtra Districts
      'Mumbai City': [18.9388, 72.8354],
      'Mumbai Suburban': [19.0760, 72.8777],
      'Pune': [18.5204, 73.8567],
      'Nagpur': [21.1458, 79.0882],
      'Thane': [19.2183, 72.9781],
      'Nashik': [19.9975, 73.7898],
      'Aurangabad': [19.8762, 75.3433],
      'Solapur': [17.6599, 75.9064],
      
      // Karnataka Districts
      'Bangalore Urban': [12.9716, 77.5946],
      'Mysore': [12.2958, 76.6394],
      'Hubli-Dharwad': [15.3647, 75.1240],
      'Mangalore': [12.9141, 74.8560],
      'Belgaum': [15.8497, 74.4977],
      
      // West Bengal Districts
      'Kolkata': [22.5726, 88.3639],
      'North 24 Parganas': [22.6708, 88.3832],
      'South 24 Parganas': [22.1667, 88.4333],
      'Howrah': [22.5958, 88.2636],
      
      // Telangana Districts
      'Hyderabad': [17.3850, 78.4867],
      'Rangareddy': [17.3850, 78.4867],
      'Warangal Urban': [17.9689, 79.5941],
      
      // Gujarat Districts
      'Ahmedabad': [23.0225, 72.5714],
      'Surat': [21.1702, 72.8311],
      'Vadodara': [22.3072, 73.1812],
      'Rajkot': [22.3039, 70.8022],
      
      // Rajasthan Districts
      'Jaipur': [26.9124, 75.7873],
      'Jodhpur': [26.2389, 73.0243],
      'Kota': [25.2138, 75.8648],
      'Bikaner': [28.0229, 73.3119],
      'Ajmer': [26.4499, 74.6399],
      'Udaipur': [24.5854, 73.7125],
      
      // Uttar Pradesh Districts
      'Lucknow': [26.8467, 80.9462],
      'Kanpur': [26.4499, 80.3319],
      'Ghaziabad': [28.6692, 77.4538],
      'Agra': [27.1767, 78.0081],
      'Meerut': [28.9845, 77.7064],
      'Varanasi': [25.3176, 82.9739],
      'Allahabad': [25.4358, 81.8463],
      'Bareilly': [28.3670, 79.4304],
      'Aligarh': [27.8974, 78.0880],
      'Moradabad': [28.8389, 78.7378],
      'Noida': [28.5355, 77.3910],
      
      // Punjab Districts
      'Ludhiana': [30.9010, 75.8573],
      'Amritsar': [31.6340, 74.8723],
      'Jalandhar': [31.3260, 75.5762],
      'Patiala': [30.3398, 76.3869],
      
      // Haryana Districts
      'Faridabad': [28.4089, 77.3178],
      'Gurgaon': [28.4595, 77.0266],
      'Hisar': [29.1492, 75.7217],
      'Rohtak': [28.8955, 76.6066],
      'Panipat': [29.3909, 76.9635],
      
      // Kerala Districts
      'Thiruvananthapuram': [8.5241, 76.9366],
      'Kochi': [9.9312, 76.2673],
      'Kozhikode': [11.2588, 75.7804],
      'Kollam': [8.8932, 76.6141],
      'Thrissur': [10.5276, 76.2144],
      
      // Andhra Pradesh Districts
      'Visakhapatnam': [17.6868, 83.2185],
      'Vijayawada': [16.5062, 80.6480],
      'Guntur': [16.3067, 80.4365],
      'Nellore': [14.4426, 79.9865],
      'Tirupati': [13.6288, 79.4192],
      
      // Madhya Pradesh Districts
      'Indore': [22.7196, 75.8577],
      'Bhopal': [23.2599, 77.4126],
      'Jabalpur': [23.1815, 79.9864],
      'Gwalior': [26.2183, 78.1828],
      'Ujjain': [23.1765, 75.7885],
      
      // Chhattisgarh Districts
      'Raipur': [21.2514, 81.6296],
      'Bhilai': [21.2167, 81.4333],
      'Bilaspur': [22.0797, 82.1409],
      
      // Jharkhand Districts
      'Ranchi': [23.3441, 85.3096],
      'Jamshedpur': [22.8046, 86.2029],
      'Dhanbad': [23.7957, 86.4304],
      
      // Bihar Districts
      'Patna': [25.5941, 85.1376],
      'Gaya': [24.7955, 85.0002],
      'Bhagalpur': [25.2425, 86.9842],
      'Muzaffarpur': [26.1225, 85.3906],
      
      // Odisha Districts
      'Bhubaneswar': [20.2961, 85.8245],
      'Cuttack': [20.4625, 85.8828],
      'Rourkela': [22.2604, 84.8536],
      
      // Assam Districts
      'Guwahati': [26.1445, 91.7362],
      'Silchar': [24.8333, 92.7789],
      'Dibrugarh': [27.4728, 94.9120],
      
      // Pincodes - Tamil Nadu
      '600001': [13.0827, 80.2707], // Chennai
      '600002': [13.0827, 80.2707],
      '600003': [13.0827, 80.2707],
      '600006': [13.0827, 80.2707],
      '600007': [13.0827, 80.2707],
      '600010': [13.0827, 80.2707],
      '600017': [13.0827, 80.2707],
      '600020': [13.0827, 80.2707],
      '600026': [13.0827, 80.2707],
      '600028': [13.0827, 80.2707],
      '600040': [13.0827, 80.2707],
      '600042': [13.0827, 80.2707],
      '600094': [13.0827, 80.2707],
      '600095': [13.0827, 80.2707],
      '600096': [13.0827, 80.2707],
      '600097': [13.0827, 80.2707],
      '600099': [13.0827, 80.2707],
      '600100': [13.0827, 80.2707],
      '600119': [13.0827, 80.2707],
      '600130': [12.8342, 79.7036], // Kanchipuram
      '641001': [11.0168, 76.9558], // Coimbatore
      '620001': [10.7905, 78.7047], // Tiruchirappalli
      '625001': [9.9252, 78.1198],  // Madurai
      
      // Pincodes - Delhi
      '110001': [28.6139, 77.2090], // New Delhi
      '110002': [28.6139, 77.2090],
      '110005': [28.6139, 77.2090],
      '110016': [28.5355, 77.2490], // South Delhi
      '110019': [28.5355, 77.2490],
      '110025': [28.6692, 77.2265], // East Delhi
      '110034': [28.7041, 77.1025], // North Delhi
      
      // Pincodes - Maharashtra
      '400001': [18.9220, 72.8347], // Mumbai
      '400002': [18.9220, 72.8347],
      '400050': [19.0330, 72.8397], // Mumbai Suburban
      '400069': [19.0330, 72.8397],
      '411001': [18.5204, 73.8567], // Pune
      '411004': [18.5204, 73.8567],
      '411014': [18.5204, 73.8567],
      '440001': [21.1458, 79.0882], // Nagpur
      
      // Pincodes - Karnataka
      '560001': [12.9716, 77.5946], // Bangalore
      '560002': [12.9716, 77.5946],
      '560025': [12.9716, 77.5946],
      '560034': [12.9716, 77.5946],
      '560037': [12.9716, 77.5946],
      '575001': [12.9141, 74.8560], // Mangalore
      '580001': [15.3647, 75.1240], // Hubli
      
      // Pincodes - West Bengal
      '700001': [22.5726, 88.3639], // Kolkata
      '700016': [22.5726, 88.3639],
      '700019': [22.5726, 88.3639],
      '700091': [22.6708, 88.3832], // North 24 Parganas
      
      // Pincodes - Telangana
      '500001': [17.3850, 78.4867], // Hyderabad
      '500003': [17.3850, 78.4867],
      '500016': [17.3850, 78.4867],
      '500034': [17.3850, 78.4867],
      
      // Pincodes - Gujarat
      '380001': [23.0225, 72.5714], // Ahmedabad
      '380015': [23.0225, 72.5714],
      '395001': [21.1702, 72.8311], // Surat
      
      // Pincodes - Rajasthan
      '302001': [26.9124, 75.7873], // Jaipur
      '302006': [26.9124, 75.7873],
      '342001': [26.2389, 73.0243], // Jodhpur
      
      // Pincodes - Uttar Pradesh
      '226001': [26.8467, 80.9462], // Lucknow
      '208001': [26.4499, 80.3319], // Kanpur
      '282001': [27.1767, 78.0081], // Agra
      '221001': [25.3176, 82.9739], // Varanasi
      '201301': [28.5355, 77.3910], // Noida
      
      // Pincodes - Punjab
      '160001': [30.7333, 76.7794], // Chandigarh
      '141001': [30.9010, 75.8573], // Ludhiana
      '143001': [31.6340, 74.8723], // Amritsar
      
      // Pincodes - Haryana
      '122001': [28.4595, 77.0266], // Gurgaon
      '121001': [28.4089, 77.3178], // Faridabad
      '134001': [30.3752, 76.7821], // Ambala
      
      // Pincodes - Kerala
      '682001': [9.9312, 76.2673],  // Kochi
      '695001': [8.5241, 76.9366],  // Thiruvananthapuram
      '673001': [11.2588, 75.7804], // Kozhikode
      
      // Pincodes - Andhra Pradesh
      '530001': [17.6868, 83.2185], // Visakhapatnam
      '520001': [16.5062, 80.6480], // Vijayawada
      
      // Pincodes - Odisha
      '751001': [20.2961, 85.8245], // Bhubaneswar
      
      // Pincodes - Madhya Pradesh
      '462001': [23.2599, 77.4126], // Bhopal
      '452001': [22.7196, 75.8577], // Indore
      
      // Pincodes - Chhattisgarh
      '492001': [21.2514, 81.6296], // Raipur
      
      // Pincodes - Jharkhand
      '834001': [23.3441, 85.3096], // Ranchi
      
      // Pincodes - Bihar
      '800001': [25.5941, 85.1376], // Patna
      
      // Pincodes - Assam
      '781001': [26.1445, 91.7362], // Guwahati
    };

    return locationCoordinates[regionName] || null;
  };

  const getColor = (caseCount: number): string => {
    if (caseCount === 0) return '#e5e7eb';
    if (caseCount <= 5) return '#10b981';
    if (caseCount <= 10) return '#f59e0b';
    if (caseCount <= 20) return '#ef4444';
    return '#dc2626';
  };

  // Style function for GeoJSON regions
  const getRegionStyle = (regionName: string) => {
    const info = regionData[regionName];
    const caseCount = info?.total || 0;
    
    return {
      fillColor: getColor(caseCount),
      weight: 2,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
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

        console.log('Map created, adding layers...');

        // Try to load state-level GeoJSON
        let stateGeoJsonLoaded = false;
        try {
          const response = await fetch('/maps/india-states.geojson');
          if (response.ok) {
            const geojsonData = await response.json();
            
            console.log('State GeoJSON loaded, creating choropleth layer...');
            
            // Create GeoJSON layer with styling
            geoJsonLayerRef.current = L.geoJSON(geojsonData, {
              style: (feature: any) => {
                const stateName = feature.properties.NAME_1;
                return getRegionStyle(stateName);
              },
              onEachFeature: (feature: any, layer: any) => {
                const stateName = feature.properties.NAME_1;
                const info = regionData[stateName];
                
                const popupContent = info ? `
                  <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${stateName}</h3>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Total Cases:</strong> ${info.total}</p>
                    <p style="margin: 4px 0; font-size: 14px;"><strong>Symptoms:</strong></p>
                    <div style="font-size: 12px;">
                      ${info.symptoms.slice(0, 5).map(s => `<span style="background: rgba(0,0,0,0.1); padding: 2px 6px; margin: 2px; border-radius: 4px; display: inline-block;">${s}</span>`).join('')}
                      ${info.symptoms.length > 5 ? `<br><small>+${info.symptoms.length - 5} more symptoms</small>` : ''}
                    </div>
                  </div>
                ` : `
                  <div style="padding: 8px;">
                    <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${stateName}</h3>
                    <p style="margin: 4px 0; font-size: 14px; color: #666;">No symptom data available</p>
                  </div>
                `;
                
                layer.bindPopup(popupContent);

                layer.on({
                  mouseover: (e: any) => {
                    const layer = e.target;
                    layer.setStyle({
                      weight: 3,
                      color: '#000',
                      fillOpacity: 0.9
                    });
                  },
                  mouseout: (e: any) => {
                    geoJsonLayerRef.current.resetStyle(e.target);
                  }
                });
              }
            }).addTo(mapInstance.current);

            stateGeoJsonLoaded = true;
            console.log('State choropleth layer added');
          }
        } catch (err) {
          console.log('Could not load state GeoJSON:', err);
        }

        // Try to load district-level GeoJSON
        try {
          const response = await fetch('/maps/india-districts.geojson');
          if (response.ok) {
            const geojsonData = await response.json();
            
            console.log('District GeoJSON loaded, adding district layer...');
            
            // Create district GeoJSON layer
            const districtLayer = L.geoJSON(geojsonData, {
              style: (feature: any) => {
                const districtName = feature.properties.name;
                return getRegionStyle(districtName);
              },
              onEachFeature: (feature: any, layer: any) => {
                const districtName = feature.properties.name;
                const info = regionData[districtName];
                
                if (info) {
                  const popupContent = `
                    <div style="padding: 8px;">
                      <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">${districtName}</h3>
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Total Cases:</strong> ${info.total}</p>
                      <p style="margin: 4px 0; font-size: 14px;"><strong>Symptoms:</strong></p>
                      <div style="font-size: 12px;">
                        ${info.symptoms.slice(0, 5).map(s => `<span style="background: rgba(0,0,0,0.1); padding: 2px 6px; margin: 2px; border-radius: 4px; display: inline-block;">${s}</span>`).join('')}
                        ${info.symptoms.length > 5 ? `<br><small>+${info.symptoms.length - 5} more symptoms</small>` : ''}
                      </div>
                    </div>
                  `;
                  
                  layer.bindPopup(popupContent);

                  layer.on({
                    mouseover: (e: any) => {
                      const layer = e.target;
                      layer.setStyle({
                        weight: 3,
                        color: '#000',
                        fillOpacity: 0.9
                      });
                    },
                    mouseout: (e: any) => {
                      layer.setStyle({
                        weight: 2,
                        color: '#ffffff',
                        fillOpacity: 0.7
                      });
                    }
                  });
                }
              }
            }).addTo(mapInstance.current);

            console.log('District layer added');
          }
        } catch (err) {
          console.log('Could not load district GeoJSON:', err);
        }

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