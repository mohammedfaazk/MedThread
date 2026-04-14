'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons (prevents 404 errors)
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

interface CountryData {
  country: string;
  countryInfo: {
    lat: number;
    long: number;
    flag: string;
    iso2: string;
  };
  cases: number;
  todayCases: number;
  deaths: number;
  todayDeaths: number;
  recovered: number;
  active: number;
  critical: number;
  casesPerOneMillion: number;
  deathsPerOneMillion: number;
  tests: number;
  testsPerOneMillion: number;
  population: number;
  updated: number;
}

interface TrendsMapProps {
  selectedCountry?: string;
  selectedDisease: string;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function TrendsMap({ selectedCountry, selectedDisease }: TrendsMapProps) {
  const [data, setData] = useState<CountryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    fetchData();
  }, [selectedDisease, selectedCountry]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let url = 'https://disease.sh/v3/covid-19/countries';
      
      if (selectedCountry && selectedCountry !== 'all') {
        url = `https://disease.sh/v3/covid-19/countries/${selectedCountry}`;
        const response = await fetch(url);
        const countryData = await response.json();
        setData([countryData]);
        
        // Zoom to selected country
        if (countryData.countryInfo) {
          setCenter([countryData.countryInfo.lat, countryData.countryInfo.long]);
          setZoom(5);
        }
      } else {
        const response = await fetch(url + '?sort=cases');
        const countriesData = await response.json();
        setData(countriesData);
        setCenter([20, 0]);
        setZoom(2);
      }
    } catch (error) {
      console.error('Failed to fetch disease data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (casesPerMillion: number) => {
    if (casesPerMillion > 10000) return '#ef4444'; // red
    if (casesPerMillion > 1000) return '#f97316'; // orange
    if (casesPerMillion > 100) return '#eab308'; // yellow
    return '#22c55e'; // green
  };

  const getMarkerSize = (cases: number) => {
    if (cases > 10000000) return 20;
    if (cases > 1000000) return 15;
    if (cases > 100000) return 10;
    return 5;
  };

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} zoom={zoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {data.map((country, index) => {
          if (!country.countryInfo?.lat || !country.countryInfo?.long) return null;
          
          return (
            <CircleMarker
              key={index}
              center={[country.countryInfo.lat, country.countryInfo.long]}
              radius={getMarkerSize(country.cases)}
              fillColor={getMarkerColor(country.casesPerOneMillion)}
              color="#fff"
              weight={1}
              opacity={1}
              fillOpacity={0.7}
            >
              <Tooltip>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    <img 
                      src={country.countryInfo.flag} 
                      alt={country.country}
                      className="w-6 h-4 object-cover rounded"
                    />
                    <span className="font-bold text-gray-900">{country.country}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">✅ Active Cases:</span>
                      <span className="font-semibold">{country.active.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">💀 Deaths:</span>
                      <span className="font-semibold">{country.deaths.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🔄 Recovered:</span>
                      <span className="font-semibold">{country.recovered.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">📊 Cases/Million:</span>
                      <span className="font-semibold">{country.casesPerOneMillion.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">🏥 Tests Done:</span>
                      <span className="font-semibold">{country.tests.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-500">📅 Last Updated:</span>
                      <span className="text-gray-500">
                        {new Date(country.updated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
