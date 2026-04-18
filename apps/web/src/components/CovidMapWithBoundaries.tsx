'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CountryData {
  country: string;
  countryInfo: {
    lat: number;
    long: number;
    flag: string;
    iso2: string;
    iso3: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  todayRecovered: number;
  active: number;
  critical: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  tests: number;
  testsPerOneMillion: number;
  population: number;
  continent: string;
  updated: number;
}

interface CovidMapProps {
  countriesData: CountryData[];
  onCountrySelect?: (country: string) => void;
}

export function CovidMapWithBoundaries({ countriesData, onCountrySelect }: CovidMapProps) {
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

    // Create a map of country data for quick lookup by ISO3 and country name
    const countryDataMap = new Map<string, CountryData>();
    const countryNameMap = new Map<string, CountryData>();
    
    countriesData.forEach(countryData => {
      const iso3 = countryData.countryInfo.iso3;
      if (iso3) {
        countryDataMap.set(iso3, countryData);
      }
      // Also map by country name for fallback
      countryNameMap.set(countryData.country.toUpperCase(), countryData);
    });

    console.log('[CovidMapWithBoundaries] Country data map size:', countryDataMap.size);
    console.log('[CovidMapWithBoundaries] Sample ISO codes:', Array.from(countryDataMap.keys()).slice(0, 5));

    // Determine color based on cases per million
    const getColor = (casesPerMillion: number): string => {
      if (casesPerMillion > 100000) return '#7F1D1D'; // Very dark red
      if (casesPerMillion > 50000) return '#991B1B';  // Dark red
      if (casesPerMillion > 10000) return '#DC2626';  // Red
      if (casesPerMillion > 5000) return '#EA580C';   // Orange
      if (casesPerMillion > 1000) return '#F59E0B';   // Amber
      if (casesPerMillion > 100) return '#EAB308';    // Yellow
      return '#10B981'; // Green
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
        const color = getColor(countryData.casesPerOneMillion);
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
          const color = getColor(countryData.casesPerOneMillion);
          
          // Create popup content
          const popupContent = `
            <div style="padding: 12px; min-width: 280px;">
              <h3 style="font-weight: bold; font-size: 18px; margin-bottom: 8px; color: #111827;">
                ${countryData.country}
              </h3>
              <div style="display: flex; flex-direction: column; gap: 4px; font-size: 14px;">
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Total Cases:</span>
                  <span style="font-weight: 600; color: #2563EB;">${countryData.cases.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Deaths:</span>
                  <span style="font-weight: 600; color: #DC2626;">${countryData.deaths.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-between;">
                  <span style="color: #6B7280;">Active:</span>
                  <span style="font-weight: 600; color: #F59E0B;">${countryData.active.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Recovered:</span>
                  <span style="font-weight: 600; color: #10B981;">${countryData.recovered.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280;">Cases/Million:</span>
                  <span style="font-weight: 600;">${countryData.casesPerOneMillion.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E7EB;">
                  <span style="color: #6B7280;">Today:</span>
                  <span style="font-weight: 600;">+${countryData.todayCases.toLocaleString()} cases</span>
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
              if (onCountrySelect) {
                onCountrySelect(countryData.country);
              }
            }
          });
        }
      }
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [countriesData, onCountrySelect, geoJsonData]);

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
        <h4 className="font-semibold text-sm mb-2 text-gray-900">Cases per Million</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-red-900 border border-red-950"></div>
            <span className="text-xs text-gray-700">&gt;100K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-red-700 border border-red-800"></div>
            <span className="text-xs text-gray-700">&gt;50K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-red-600 border border-red-700"></div>
            <span className="text-xs text-gray-700">&gt;10K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-orange-600 border border-orange-700"></div>
            <span className="text-xs text-gray-700">&gt;5K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-amber-500 border border-amber-600"></div>
            <span className="text-xs text-gray-700">&gt;1K</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-yellow-500 border border-yellow-600"></div>
            <span className="text-xs text-gray-700">&gt;100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 rounded bg-green-500 border border-green-600"></div>
            <span className="text-xs text-gray-700">&lt;100</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
          Hover over countries for details
        </p>
      </div>
    </div>
  );
}
