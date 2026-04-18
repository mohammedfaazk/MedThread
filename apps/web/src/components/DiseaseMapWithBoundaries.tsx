'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryDiseaseData } from '@/lib/api/trends';

interface DiseaseMapProps {
  data: CountryDiseaseData[];
  disease: string;
  onCountryClick?: (country: string) => void;
}

// Country ISO codes mapping
const countryISOCodes: Record<string, string> = {
  'India': 'IND', 'China': 'CHN', 'Indonesia': 'IDN', 'Philippines': 'PHL',
  'Pakistan': 'PAK', 'Nigeria': 'NGA', 'Bangladesh': 'BGD', 'South Africa': 'ZAF',
  'Myanmar': 'MMR', 'Kenya': 'KEN', 'Thailand': 'THA', 'Ethiopia': 'ETH',
  'Vietnam': 'VNM', 'Brazil': 'BRA', 'Russia': 'RUS', 'Democratic Republic of Congo': 'COD',
  'Uganda': 'UGA', 'Mozambique': 'MOZ', 'Niger': 'NER', 'Burkina Faso': 'BFA',
  'Mali': 'MLI', 'Tanzania': 'TZA', 'Cameroon': 'CMR', 'Ghana': 'GHA',
  'Angola': 'AGO', 'Benin': 'BEN', 'Sudan': 'SDN', 'Mexico': 'MEX',
  'Colombia': 'COL', 'Malaysia': 'MYS', 'Singapore': 'SGP', 'Sri Lanka': 'LKA',
  'Peru': 'PER', 'Argentina': 'ARG', 'United States': 'USA', 'Japan': 'JPN',
  'Germany': 'DEU', 'United Kingdom': 'GBR', 'France': 'FRA', 'Italy': 'ITA',
  'Canada': 'CAN', 'Spain': 'ESP', 'Australia': 'AUS'
};

export function DiseaseMapWithBoundaries({ data, disease, onCountryClick }: DiseaseMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch world GeoJSON data
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson')
      .then(res => res.json())
      .then(data => {
        setGeoJsonData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading GeoJSON:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined' || !geoJsonData) return;

    console.log('[DiseaseMapWithBoundaries] Rendering map with data:', data.length, 'countries');
    console.log('[DiseaseMapWithBoundaries] First country:', data[0]);

    // Initialize map if not already created
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
        worldCopyJump: true,
        maxBounds: [[-90, -180], [90, 180]],
        maxBoundsViscosity: 1.0
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
        noWrap: true,
        bounds: [[-90, -180], [90, 180]]
      }).addTo(mapRef.current);
    }

    // Clear existing layers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Create a map of country data for quick lookup by both ISO code and name
    const countryDataMap = new Map<string, CountryDiseaseData>();
    const countryNameMap = new Map<string, CountryDiseaseData>();
    
    data.forEach(countryData => {
      const isoCode = countryISOCodes[countryData.country];
      if (isoCode) {
        countryDataMap.set(isoCode, countryData);
      }
      // Also map by country name for fallback
      countryNameMap.set(countryData.country.toUpperCase(), countryData);
    });

    console.log('[DiseaseMapWithBoundaries] Country data map size:', countryDataMap.size);
    console.log('[DiseaseMapWithBoundaries] Sample ISO codes:', Array.from(countryDataMap.keys()).slice(0, 5));

    // Color mapping based on risk level
    const colorMap = {
      critical: '#DC2626', // red-600
      high: '#EA580C',     // orange-600
      medium: '#F59E0B',   // amber-500
      low: '#10B981'       // green-500
    };

    // Style function for GeoJSON features
    const style = (feature: any) => {
      const isoCode = feature.properties.ISO_A3;
      const countryName = feature.properties.ADMIN || feature.properties.NAME;
      
      // Try to find by ISO code first
      let countryData = countryDataMap.get(isoCode);
      
      // If not found, try by country name
      if (!countryData && countryName) {
        countryData = countryNameMap.get(countryName.toUpperCase());
      }

      if (countryData) {
        const color = colorMap[countryData.riskLevel];
        return {
          fillColor: color,
          fillOpacity: 0.7,
          color: color,
          weight: 2,
          opacity: 1
        };
      }

      // Default style for countries without data
      return {
        fillColor: '#E5E7EB',
        fillOpacity: 0.3,
        color: '#9CA3AF',
        weight: 1,
        opacity: 0.5
      };
    };

    // Add GeoJSON layer
    const geoJsonLayer = L.geoJSON(geoJsonData, {
      style: style,
      onEachFeature: (feature, layer) => {
        const isoCode = feature.properties.ISO_A3;
        const countryName = feature.properties.ADMIN || feature.properties.NAME;
        
        // Try to find by ISO code first
        let countryData = countryDataMap.get(isoCode);
        
        // If not found, try by country name
        if (!countryData && countryName) {
          countryData = countryNameMap.get(countryName.toUpperCase());
        }

        if (countryData) {
          const color = colorMap[countryData.riskLevel];
          
          // Create popup content
          const popupContent = `
            <div style="padding: 12px; min-width: 250px;">
              <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #111827;">
                ${countryData.country}
              </h3>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Disease:</span>
                  <span style="font-weight: 600; text-transform: capitalize;">${disease}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Cases:</span>
                  <span style="font-weight: 600; color: #2563EB;">${countryData.cases.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Deaths:</span>
                  <span style="font-weight: 600; color: #DC2626;">${countryData.deaths.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Prevalence:</span>
                  <span style="font-weight: 600;">${countryData.prevalence} per 100k</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                  <span style="color: #6B7280;">Risk Level:</span>
                  <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; color: white; background-color: ${color};">
                    ${countryData.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          `;

          layer.bindPopup(popupContent);

          // Hover effects
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                weight: 3,
                fillOpacity: 0.9
              });
            },
            mouseout: (e) => {
              geoJsonLayer.resetStyle(e.target);
            },
            click: () => {
              if (onCountryClick) {
                onCountryClick(countryData.country);
              }
            }
          });
        }
      }
    }).addTo(mapRef.current);

    // Fit bounds to show all highlighted countries
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(d => [d.lat, d.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 3 });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data, disease, onCountryClick, geoJsonData]);

  if (loading) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center border-2 border-gray-200">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainerRef} 
        className="w-full h-[600px] rounded-xl border-2 border-gray-200 shadow-lg"
        style={{ background: '#aad3df' }}
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-sm mb-2 text-gray-900">Risk Level</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-red-600 border border-red-700"></div>
            <span className="text-xs text-gray-700">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-orange-600 border border-orange-700"></div>
            <span className="text-xs text-gray-700">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-amber-500 border border-amber-600"></div>
            <span className="text-xs text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-xs text-gray-700">Low</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
          Hover over countries for details
        </p>
      </div>
    </div>
  );
}
