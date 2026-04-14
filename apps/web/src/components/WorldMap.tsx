'use client';

import React, { memo, useCallback, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from 'react-simple-maps';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { getDiseaseDataForCountry, countryHasDisease } from '@/data/diseaseData';

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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
  active: number;
  recovered: number;
  casesPerOneMillion: number;
}

interface WorldMapProps {
  data: CountryData[];
  onCountryHover?: (country: CountryData | null) => void;
  selectedSymptom?: string;
}

const WorldMap: React.FC<WorldMapProps> = ({ data, onCountryHover, selectedSymptom = 'all' }) => {
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  const handleZoomIn = () => {
    setZoom((prevZoom) => Math.min(prevZoom * 1.5, 8));
  };

  const handleZoomOut = () => {
    setZoom((prevZoom) => Math.max(prevZoom / 1.5, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setCenter([0, 20]);
  };

  const handleMoveEnd = (position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates);
    setZoom(position.zoom);
  };

  const getSeverityColor = (country: CountryData) => {
    // If specific disease is selected, use disease-specific data
    if (selectedSymptom && selectedSymptom !== 'all') {
      const diseaseData = getDiseaseDataForCountry(country.country, selectedSymptom);
      if (diseaseData) {
        switch (diseaseData.prevalence) {
          case 'Very High': return '#DC2626'; // Dark Red
          case 'High': return '#F97316'; // Orange
          case 'Moderate': return '#EAB308'; // Yellow
          case 'Low': return '#22C55E'; // Green
        }
      }
      // If disease not found in country, show gray
      if (!countryHasDisease(country.country, selectedSymptom)) {
        return '#9CA3AF'; // Gray
      }
    }
    
    // Default: use COVID cases per million
    const casesPerMillion = country.casesPerOneMillion || 0;
    if (casesPerMillion > 100000) return '#EF4444'; // Red
    if (casesPerMillion > 50000) return '#F97316'; // Orange
    if (casesPerMillion > 10000) return '#EAB308'; // Yellow
    return '#22C55E'; // Green
  };

  const getMarkerSize = (country: CountryData) => {
    // If specific disease is selected, use disease-specific data
    if (selectedSymptom && selectedSymptom !== 'all') {
      const diseaseData = getDiseaseDataForCountry(country.country, selectedSymptom);
      if (diseaseData) {
        return Math.min(Math.max(Math.log(diseaseData.annualCases) * 1.2, 4), 18);
      }
      // If disease not in country, show small marker
      if (!countryHasDisease(country.country, selectedSymptom)) {
        return 3;
      }
    }
    
    // Default: use COVID cases
    const cases = country.cases || 1;
    return Math.min(Math.max(Math.log(cases) * 1.5, 4), 20);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const handleMarkerEnter = useCallback((country: CountryData) => {
    if (onCountryHover) {
      onCountryHover(country);
    }
  }, [onCountryHover]);

  const handleMarkerLeave = useCallback(() => {
    if (onCountryHover) {
      onCountryHover(null);
    }
  }, [onCountryHover]);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg overflow-hidden relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl border border-blue-200"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomOut}
          className="bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl border border-blue-200"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="bg-white hover:bg-blue-50 text-blue-600 p-2 rounded-lg shadow-lg transition-all hover:shadow-xl border border-blue-200"
          title="Reset View"
        >
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 147,
          center: [0, 20]
        }}
        style={{
          width: '100%',
          height: '100%'
        }}
      >
        <ZoomableGroup 
          zoom={zoom} 
          center={center}
          onMoveEnd={handleMoveEnd}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#93C5FD"
                  stroke="#3B82F6"
                  strokeWidth={0.5}
                  style={{
                    default: {
                      fill: '#93C5FD',
                      stroke: '#3B82F6',
                      strokeWidth: 0.5,
                      outline: 'none'
                    },
                    hover: {
                      fill: '#60A5FA',
                      stroke: '#2563EB',
                      strokeWidth: 0.75,
                      outline: 'none'
                    },
                    pressed: {
                      fill: '#3B82F6',
                      stroke: '#1D4ED8',
                      strokeWidth: 1,
                      outline: 'none'
                    }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Markers for disease data */}
          {data.slice(0, 100).map((country) => {
            const size = getMarkerSize(country);
            const color = getSeverityColor(country);

            return (
              <Marker
                key={country.countryInfo.iso2}
                coordinates={[country.countryInfo.long, country.countryInfo.lat]}
                onMouseEnter={() => handleMarkerEnter(country)}
                onMouseLeave={handleMarkerLeave}
              >
                <circle
                  r={size}
                  fill={color}
                  fillOpacity={0.7}
                  stroke="#fff"
                  strokeWidth={0.5}
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  className="hover:fill-opacity-100"
                />
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

export default memo(WorldMap);
