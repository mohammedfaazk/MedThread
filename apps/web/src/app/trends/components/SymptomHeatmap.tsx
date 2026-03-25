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
                'Ahmedabad': [23.0225, 72.5714],
                'Jaipur': [26.9124, 75.7873],
                'Lucknow': [26.8467, 80.9462],
                'Surat': [21.1702, 72.8311],
                'Kanpur': [26.4499, 80.3319],
                'Nagpur': [21.1458, 79.0882],
                'Indore': [22.7196, 75.8577],
                'Thane': [19.2183, 72.9781],
                'Bhopal': [23.2599, 77.4126],
                'Visakhapatnam': [17.6868, 83.2185],
                'Pimpri-Chinchwad': [18.6298, 73.7997],
                'Patna': [25.5941, 85.1376],
                'Vadodara': [22.3072, 73.1812],
                'Ghaziabad': [28.6692, 77.4538],
                'Ludhiana': [30.9010, 75.8573],
                'Agra': [27.1767, 78.0081],
                'Nashik': [19.9975, 73.7898],
                'Faridabad': [28.4089, 77.3178],
                'Meerut': [28.9845, 77.7064],
                'Rajkot': [22.3039, 70.8022],
                'Kalyan-Dombivali': [19.2403, 73.1305],
                'Vasai-Virar': [19.4612, 72.7985],
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
              };
              coords = cityCoords[regionName] || null;
            } else if (regionType === 'district') {
              // For districts, comprehensive coordinate mapping
              const districtCoords: Record<string, [number, number]> = {
                // Tamil Nadu
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
                'Cuddalore': [11.7480, 79.7714],
                'Tiruppur': [11.1085, 77.3411],
                'Karur': [10.9601, 78.0766],
                'Ramanathapuram': [9.3639, 78.8377],
                'Virudhunagar': [9.5810, 77.9624],
                'Nagapattinam': [10.7672, 79.8449],
                'Namakkal': [11.2189, 78.1677],
                'Pudukkottai': [10.3833, 78.8000],
                
                // Delhi
                'Central Delhi': [28.6519, 77.2315],
                'North Delhi': [28.7041, 77.1025],
                'South Delhi': [28.5355, 77.2490],
                'East Delhi': [28.6692, 77.2265],
                'West Delhi': [28.6517, 77.1048],
                'North East Delhi': [28.7041, 77.2750],
                'North West Delhi': [28.7041, 77.0910],
                'South East Delhi': [28.5355, 77.2750],
                'South West Delhi': [28.6139, 77.0369],
                'New Delhi': [28.6139, 77.2090],
                'Shahdara': [28.6692, 77.2850],
                
                // Maharashtra
                'Mumbai City': [18.9388, 72.8354],
                'Mumbai Suburban': [19.0760, 72.8777],
                'Pune': [18.5204, 73.8567],
                'Nagpur': [21.1458, 79.0882],
                'Thane': [19.2183, 72.9781],
                'Nashik': [19.9975, 73.7898],
                'Aurangabad': [19.8762, 75.3433],
                'Solapur': [17.6599, 75.9064],
                'Kolhapur': [16.7050, 74.2433],
                'Ahmednagar': [19.0948, 74.7480],
                'Amravati': [20.9374, 77.7796],
                'Sangli': [16.8524, 74.5815],
                'Jalgaon': [21.0077, 75.5626],
                'Akola': [20.7002, 77.0082],
                'Latur': [18.4088, 76.5604],
                'Dhule': [20.9042, 74.7749],
                'Satara': [17.6805, 73.9903],
                'Raigad': [18.5204, 73.0200],
                'Ratnagiri': [16.9902, 73.3120],
                'Beed': [18.9894, 75.7607],
                
                // Karnataka
                'Bangalore Urban': [12.9716, 77.5946],
                'Mysore': [12.2958, 76.6394],
                'Hubli-Dharwad': [15.3647, 75.1240],
                'Mangalore': [12.9141, 74.8560],
                'Belgaum': [15.8497, 74.4977],
                'Gulbarga': [17.3297, 76.8343],
                'Davanagere': [14.4644, 75.9218],
                'Bellary': [15.1394, 76.9214],
                'Bijapur': [16.8302, 75.7100],
                'Shimoga': [13.9299, 75.5681],
                'Tumkur': [13.3392, 77.1006],
                'Raichur': [16.2120, 77.3439],
                'Bidar': [17.9130, 77.5200],
                'Hospet': [15.2695, 76.3870],
                'Hassan': [13.0072, 76.0962],
                'Gadag': [15.4167, 75.6167],
                'Udupi': [13.3409, 74.7421],
                'Kolar': [13.1358, 78.1298],
                'Mandya': [12.5244, 76.8958],
                'Chikmagalur': [13.3161, 75.7720],
                
                // West Bengal
                'Kolkata': [22.5726, 88.3639],
                'North 24 Parganas': [22.6708, 88.3832],
                'South 24 Parganas': [22.1667, 88.4333],
                'Howrah': [22.5958, 88.2636],
                'Hooghly': [22.9089, 88.3967],
                'Bardhaman': [23.2324, 87.8615],
                'Murshidabad': [24.1833, 88.2667],
                'Nadia': [23.4731, 88.5564],
                'Malda': [25.0096, 88.1410],
                'Jalpaiguri': [26.5167, 88.7167],
                'Darjeeling': [27.0360, 88.2627],
                'Cooch Behar': [26.3157, 89.4497],
                'Purulia': [23.3321, 86.3616],
                'Bankura': [23.2324, 87.0696],
                'Birbhum': [23.8403, 87.6186],
                'Paschim Medinipur': [22.4292, 87.3211],
                'Purba Medinipur': [22.0209, 87.7395],
                
                // Telangana
                'Hyderabad': [17.3850, 78.4867],
                'Rangareddy': [17.3850, 78.4867],
                'Medchal-Malkajgiri': [17.5485, 78.4802],
                'Warangal Urban': [17.9689, 79.5941],
                'Warangal Rural': [17.9689, 79.5941],
                'Khammam': [17.2473, 80.1514],
                'Karimnagar': [18.4386, 79.1288],
                'Nizamabad': [18.6725, 78.0941],
                'Mahbubnagar': [16.7488, 77.9738],
                'Nalgonda': [17.0500, 79.2667],
                'Adilabad': [19.6640, 78.5320],
                
                // Gujarat
                'Ahmedabad': [23.0225, 72.5714],
                'Surat': [21.1702, 72.8311],
                'Vadodara': [22.3072, 73.1812],
                'Rajkot': [22.3039, 70.8022],
                'Bhavnagar': [21.7645, 72.1519],
                'Jamnagar': [22.4707, 70.0577],
                'Junagadh': [21.5222, 70.4579],
                'Gandhinagar': [23.2156, 72.6369],
                'Anand': [22.5645, 72.9289],
                'Mehsana': [23.5880, 72.3693],
                'Kheda': [22.7500, 72.6833],
                'Patan': [23.8333, 72.1167],
                'Banaskantha': [24.1719, 72.4386],
                'Sabarkantha': [23.4833, 73.0500],
                'Kutch': [23.7337, 69.8597],
                
                // Rajasthan
                'Jaipur': [26.9124, 75.7873],
                'Jodhpur': [26.2389, 73.0243],
                'Kota': [25.2138, 75.8648],
                'Bikaner': [28.0229, 73.3119],
                'Ajmer': [26.4499, 74.6399],
                'Udaipur': [24.5854, 73.7125],
                'Bhilwara': [25.3407, 74.6408],
                'Alwar': [27.5530, 76.6346],
                'Bharatpur': [27.2152, 77.4897],
                'Sikar': [27.6119, 75.1397],
                'Pali': [25.7711, 73.3234],
                'Tonk': [26.1500, 75.7833],
                'Chittorgarh': [24.8887, 74.6269],
                'Barmer': [25.7500, 71.3833],
                'Jhunjhunu': [28.1300, 75.3980],
                
                // Uttar Pradesh
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
                'Saharanpur': [29.9680, 77.5460],
                'Gorakhpur': [26.7606, 83.3732],
                'Noida': [28.5355, 77.3910],
                'Firozabad': [27.1591, 78.3957],
                'Jhansi': [25.4484, 78.5685],
                'Muzaffarnagar': [29.4727, 77.7085],
                'Mathura': [27.4924, 77.6737],
                'Rampur': [28.8154, 79.0250],
                'Shahjahanpur': [27.8800, 79.9050],
                'Farrukhabad': [27.3882, 79.5800],
                
                // Punjab
                'Ludhiana': [30.9010, 75.8573],
                'Amritsar': [31.6340, 74.8723],
                'Jalandhar': [31.3260, 75.5762],
                'Patiala': [30.3398, 76.3869],
                'Bathinda': [30.2110, 74.9455],
                'Mohali': [30.7046, 76.7179],
                'Hoshiarpur': [31.5332, 75.9116],
                'Firozpur': [30.9257, 74.6142],
                'Pathankot': [32.2746, 75.6521],
                'Moga': [30.8158, 75.1705],
                'Kapurthala': [31.3800, 75.3800],
                'Sangrur': [30.2450, 75.8450],
                'Faridkot': [30.6704, 74.7556],
                'Gurdaspur': [32.0400, 75.4050],
                
                // Haryana
                'Faridabad': [28.4089, 77.3178],
                'Gurgaon': [28.4595, 77.0266],
                'Hisar': [29.1492, 75.7217],
                'Rohtak': [28.8955, 76.6066],
                'Panipat': [29.3909, 76.9635],
                'Karnal': [29.6857, 76.9905],
                'Sonipat': [28.9931, 77.0151],
                'Yamunanagar': [30.1290, 77.2674],
                'Panchkula': [30.6942, 76.8606],
                'Bhiwani': [28.7930, 76.1395],
                'Ambala': [30.3752, 76.7821],
                'Rewari': [28.1989, 76.6193],
                'Jind': [29.3157, 76.3160],
                'Sirsa': [29.5353, 75.0289],
                'Fatehabad': [29.5152, 75.4551],
                
                // Kerala
                'Thiruvananthapuram': [8.5241, 76.9366],
                'Kochi': [9.9312, 76.2673],
                'Kozhikode': [11.2588, 75.7804],
                'Kollam': [8.8932, 76.6141],
                'Thrissur': [10.5276, 76.2144],
                'Kannur': [11.8745, 75.3704],
                'Alappuzha': [9.4981, 76.3388],
                'Palakkad': [10.7867, 76.6548],
                'Malappuram': [11.0510, 76.0711],
                'Kottayam': [9.5916, 76.5222],
                'Kasaragod': [12.4996, 74.9869],
                'Pathanamthitta': [9.2648, 76.7870],
                'Idukki': [9.9189, 77.1025],
                'Wayanad': [11.6854, 76.1320],
                
                // Andhra Pradesh
                'Visakhapatnam': [17.6868, 83.2185],
                'Vijayawada': [16.5062, 80.6480],
                'Guntur': [16.3067, 80.4365],
                'Nellore': [14.4426, 79.9865],
                'Kurnool': [15.8281, 78.0373],
                'Kakinada': [16.9891, 82.2475],
                'Rajahmundry': [17.0005, 81.8040],
                'Tirupati': [13.6288, 79.4192],
                'Kadapa': [14.4673, 78.8242],
                'Anantapur': [14.6819, 77.6006],
                'Chittoor': [13.2172, 79.1003],
                'Prakasam': [15.3500, 79.5833],
                'East Godavari': [17.0005, 81.8040],
                'West Godavari': [16.7167, 81.1000],
                'Krishna': [16.5062, 80.6480],
                
                // Madhya Pradesh
                'Indore': [22.7196, 75.8577],
                'Bhopal': [23.2599, 77.4126],
                'Jabalpur': [23.1815, 79.9864],
                'Gwalior': [26.2183, 78.1828],
                'Ujjain': [23.1765, 75.7885],
                'Sagar': [23.8388, 78.7378],
                'Dewas': [22.9676, 76.0534],
                'Satna': [24.6005, 80.8322],
                'Ratlam': [23.3315, 75.0367],
                'Rewa': [24.5364, 81.2961],
                'Katni': [23.8346, 80.3947],
                'Singrauli': [24.2000, 82.6667],
                'Burhanpur': [21.3000, 76.2333],
                'Khandwa': [21.8333, 76.3500],
                'Morena': [26.4950, 78.0014],
                
                // Chhattisgarh
                'Raipur': [21.2514, 81.6296],
                'Bhilai': [21.2167, 81.4333],
                'Bilaspur': [22.0797, 82.1409],
                'Korba': [22.3595, 82.7501],
                'Durg': [21.1900, 81.2849],
                'Rajnandgaon': [21.0974, 81.0364],
                'Jagdalpur': [19.0728, 82.0311],
                'Raigarh': [21.8974, 83.3950],
                'Ambikapur': [23.1181, 83.1936],
                'Dhamtari': [20.7070, 81.5497],
                
                // Jharkhand
                'Ranchi': [23.3441, 85.3096],
                'Jamshedpur': [22.8046, 86.2029],
                'Dhanbad': [23.7957, 86.4304],
                'Bokaro': [23.6693, 86.1511],
                'Deoghar': [24.4833, 86.7000],
                'Hazaribagh': [23.9929, 85.3615],
                'Giridih': [24.1894, 86.3000],
                'Ramgarh': [23.6333, 85.5167],
                'Dumka': [24.2667, 87.2500],
                'Palamu': [24.0333, 84.0667],
                
                // Bihar
                'Patna': [25.5941, 85.1376],
                'Gaya': [24.7955, 85.0002],
                'Bhagalpur': [25.2425, 86.9842],
                'Muzaffarpur': [26.1225, 85.3906],
                'Darbhanga': [26.1542, 85.8918],
                'Purnia': [25.7771, 87.4753],
                'Arrah': [25.5562, 84.6644],
                'Begusarai': [25.4182, 86.1272],
                'Katihar': [25.5394, 87.5678],
                'Munger': [25.3753, 86.4731],
                'Chhapra': [25.7830, 84.7278],
                'Saharsa': [25.8804, 86.5970],
                'Sasaram': [24.9519, 84.0330],
                'Hajipur': [25.6892, 85.2096],
                'Dehri': [24.9048, 84.1820],
                
                // Odisha
                'Bhubaneswar': [20.2961, 85.8245],
                'Cuttack': [20.4625, 85.8828],
                'Rourkela': [22.2604, 84.8536],
                'Berhampur': [19.3150, 84.7941],
                'Sambalpur': [21.4669, 83.9812],
                'Puri': [19.8135, 85.8312],
                'Balasore': [21.4934, 86.9336],
                'Bhadrak': [21.0542, 86.4953],
                'Baripada': [21.9347, 86.7337],
                'Jharsuguda': [21.8538, 84.0070],
                
                // Assam
                'Guwahati': [26.1445, 91.7362],
                'Silchar': [24.8333, 92.7789],
                'Dibrugarh': [27.4728, 94.9120],
                'Jorhat': [26.7509, 94.2037],
                'Nagaon': [26.3484, 92.6856],
                'Tinsukia': [27.4900, 95.3600],
                'Tezpur': [26.6338, 92.8000],
                'Bongaigaon': [26.4833, 90.5500],
                'Dhubri': [26.0167, 89.9833],
                'Karimganj': [24.8667, 92.3500],
              };
              coords = districtCoords[regionName] || null;
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