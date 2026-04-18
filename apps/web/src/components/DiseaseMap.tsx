'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CountryDiseaseData } from '@/lib/api/trends';

interface DiseaseMapProps {
  data: CountryDiseaseData[];
  disease: string;
  onCountryClick?: (country: string) => void;
}

export function DiseaseMap({ data, disease, onCountryClick }: DiseaseMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || typeof window === 'undefined') return;

    // Initialize map if not already created
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 18,
        worldCopyJump: true, // Prevent multiple world copies
        maxBounds: [[-90, -180], [90, 180]], // Restrict to single world view
        maxBoundsViscosity: 1.0 // Make bounds solid
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 18,
        noWrap: true, // Prevent map wrapping
        bounds: [[-90, -180], [90, 180]]
      }).addTo(mapRef.current);
    }

    // Clear existing markers
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        mapRef.current?.removeLayer(layer);
      }
    });

    // Add markers for each country
    data.forEach((countryData) => {
      if (!mapRef.current) return;

      const { lat, lng, country, cases, deaths, riskLevel, prevalence } = countryData;

      // Determine marker color and size based on risk level
      const colorMap = {
        critical: '#DC2626', // red-600
        high: '#EA580C',     // orange-600
        medium: '#F59E0B',   // amber-500
        low: '#10B981'       // green-500
      };

      const sizeMap = {
        critical: 25,
        high: 20,
        medium: 15,
        low: 10
      };

      const color = colorMap[riskLevel];
      const size = sizeMap[riskLevel];

      // Create circle marker
      const circle = L.circle([lat, lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.6,
        radius: size * 50000, // Scale for visibility
        weight: 2
      }).addTo(mapRef.current);

      // Create popup content
      const popupContent = `
        <div class="p-3 min-w-[250px]">
          <h3 class="font-bold text-lg mb-2 text-gray-900">${country}</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Disease:</span>
              <span class="font-semibold capitalize">${disease}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Cases:</span>
              <span class="font-semibold text-blue-600">${cases.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Deaths:</span>
              <span class="font-semibold text-red-600">${deaths.toLocaleString()}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Prevalence:</span>
              <span class="font-semibold">${prevalence} per 100k</span>
            </div>
            <div class="flex justify-between items-center mt-2 pt-2 border-t">
              <span class="text-gray-600">Risk Level:</span>
              <span class="px-2 py-1 rounded text-xs font-bold text-white" style="background-color: ${color}">
                ${riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      `;

      circle.bindPopup(popupContent);

      // Add click handler
      circle.on('click', () => {
        if (onCountryClick) {
          onCountryClick(country);
        }
      });
    });

    // Fit bounds to show all markers
    if (data.length > 0) {
      const bounds = L.latLngBounds(data.map(d => [d.lat, d.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 5 });
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [data, disease, onCountryClick]);

  return (
    <div className="relative">
      <style jsx global>{`
        .leaflet-container {
          background: #aad3df !important;
        }
        .leaflet-tile-container {
          pointer-events: auto;
        }
        .leaflet-tile {
          max-width: none !important;
        }
      `}</style>
      <div 
        ref={mapContainerRef} 
        className="w-full h-[600px] rounded-xl border-2 border-gray-200 shadow-lg"
      />
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h4 className="font-semibold text-sm mb-2 text-gray-900">Risk Level</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-600"></div>
            <span className="text-xs text-gray-700">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span className="text-xs text-gray-700">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span className="text-xs text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-700">Low</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t">
          Circle size indicates case burden
        </p>
      </div>
    </div>
  );
}
