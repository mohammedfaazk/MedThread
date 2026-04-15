'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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

interface TrendsMapProps {
  countriesData: CountryData[];
  statesData: any[];
  selectedCountry: string;
  selectedState: string;
  onCountrySelect: (country: string) => void;
  showStates: boolean;
}

// Component to handle map zoom when country is selected
function MapController({ selectedCountry, selectedState, countriesData, statesData }: { 
  selectedCountry: string; 
  selectedState: string;
  countriesData: CountryData[];
  statesData: any[];
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedState && statesData.length > 0) {
      // Zoom to state
      const state = statesData.find(s => s.state === selectedState);
      if (state) {
        // Use approximate coordinates for US states
        const stateCoords: Record<string, [number, number]> = {
          'California': [36.7783, -119.4179],
          'Texas': [31.9686, -99.9018],
          'Florida': [27.6648, -81.5158],
          'New York': [43.2994, -74.2179],
          // Add more as needed
        };
        const coords = stateCoords[state.state] || [37.0902, -95.7129]; // Default to US center
        map.flyTo(coords, 6, { duration: 1.5 });
      }
    } else if (selectedCountry && countriesData.length > 0) {
      const country = countriesData.find(c => c.country === selectedCountry);
      if (country) {
        map.flyTo([country.countryInfo.lat, country.countryInfo.long], 5, {
          duration: 1.5
        });
      }
    } else {
      // Reset to world view
      map.flyTo([20, 0], 2, {
        duration: 1.5
      });
    }
  }, [selectedCountry, selectedState, countriesData, statesData, map]);

  return null;
}

export default function TrendsMap({ 
  countriesData, 
  statesData,
  selectedCountry, 
  selectedState,
  onCountrySelect,
  showStates 
}: TrendsMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Determine marker color based on cases per million
  const getMarkerColor = (casesPerMillion: number): string => {
    if (casesPerMillion > 10000) return '#ef4444'; // Red
    if (casesPerMillion > 1000) return '#f97316'; // Orange
    if (casesPerMillion > 100) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  // Determine marker size based on total cases
  const getMarkerSize = (cases: number): number => {
    if (cases > 10000000) return 25; // 10M+
    if (cases > 1000000) return 20; // 1M+
    if (cases > 100000) return 15; // 100K+
    if (cases > 10000) return 10; // 10K+
    return 5; // <10K
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Approximate coordinates for US states (for demonstration)
  const stateCoordinates: Record<string, [number, number]> = {
    'Alabama': [32.806671, -86.791130],
    'Alaska': [61.370716, -152.404419],
    'Arizona': [33.729759, -111.431221],
    'Arkansas': [34.969704, -92.373123],
    'California': [36.116203, -119.681564],
    'Colorado': [39.059811, -105.311104],
    'Connecticut': [41.597782, -72.755371],
    'Delaware': [39.318523, -75.507141],
    'Florida': [27.766279, -81.686783],
    'Georgia': [33.040619, -83.643074],
    'Hawaii': [21.094318, -157.498337],
    'Idaho': [44.240459, -114.478828],
    'Illinois': [40.349457, -88.986137],
    'Indiana': [39.849426, -86.258278],
    'Iowa': [42.011539, -93.210526],
    'Kansas': [38.526600, -96.726486],
    'Kentucky': [37.668140, -84.670067],
    'Louisiana': [31.169546, -91.867805],
    'Maine': [44.693947, -69.381927],
    'Maryland': [39.063946, -76.802101],
    'Massachusetts': [42.230171, -71.530106],
    'Michigan': [43.326618, -84.536095],
    'Minnesota': [45.694454, -93.900192],
    'Mississippi': [32.741646, -89.678696],
    'Missouri': [38.456085, -92.288368],
    'Montana': [46.921925, -110.454353],
    'Nebraska': [41.125370, -98.268082],
    'Nevada': [38.313515, -117.055374],
    'New Hampshire': [43.452492, -71.563896],
    'New Jersey': [40.298904, -74.521011],
    'New Mexico': [34.840515, -106.248482],
    'New York': [42.165726, -74.948051],
    'North Carolina': [35.630066, -79.806419],
    'North Dakota': [47.528912, -99.784012],
    'Ohio': [40.388783, -82.764915],
    'Oklahoma': [35.565342, -96.928917],
    'Oregon': [44.572021, -122.070938],
    'Pennsylvania': [40.590752, -77.209755],
    'Rhode Island': [41.680893, -71.511780],
    'South Carolina': [33.856892, -80.945007],
    'South Dakota': [44.299782, -99.438828],
    'Tennessee': [35.747845, -86.692345],
    'Texas': [31.054487, -97.563461],
    'Utah': [40.150032, -111.862434],
    'Vermont': [44.045876, -72.710686],
    'Virginia': [37.769337, -78.169968],
    'Washington': [47.400902, -121.490494],
    'West Virginia': [38.491226, -80.954453],
    'Wisconsin': [44.268543, -89.616508],
    'Wyoming': [42.755966, -107.302490],
  };

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border border-gray-200">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController 
          selectedCountry={selectedCountry} 
          selectedState={selectedState}
          countriesData={countriesData}
          statesData={statesData}
        />

        {/* Render state markers if showing US states */}
        {showStates && statesData.map((state) => {
          const coords = stateCoordinates[state.state];
          if (!coords) return null;

          const casesPerMillion = (state.cases / state.population) * 1000000;
          const color = getMarkerColor(casesPerMillion);
          const size = getMarkerSize(state.cases);

          return (
            <CircleMarker
              key={state.state}
              center={coords}
              radius={size}
              pathOptions={{
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6,
              }}
            >
              <Popup>
                <div className="p-2 min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <h3 className="font-bold text-lg text-gray-900">{state.state}, USA</h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">✅ Active Cases:</span>
                      <span className="font-semibold text-orange-600">{formatNumber(state.active)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">💀 Deaths:</span>
                      <span className="font-semibold text-red-600">{formatNumber(state.deaths)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">📊 Total Cases:</span>
                      <span className="font-semibold text-blue-600">{formatNumber(state.cases)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">🏥 Tests Done:</span>
                      <span className="font-semibold text-purple-600">{formatNumber(state.tests)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600">📅 Last Updated:</span>
                      <span className="font-semibold text-gray-700 text-xs">{formatDate(state.updated)}</span>
                    </div>

                    {state.todayCases > 0 && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                        <span className="text-orange-700">
                          📈 +{formatNumber(state.todayCases)} new cases today
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render country markers */}
        {!showStates && countriesData.map((country) => {
          const color = getMarkerColor(country.casesPerOneMillion);
          const size = getMarkerSize(country.cases);

          return (
            <CircleMarker
              key={country.country}
              center={[country.countryInfo.lat, country.countryInfo.long]}
              radius={size}
              pathOptions={{
                fillColor: color,
                color: color,
                weight: 2,
                opacity: 0.8,
                fillOpacity: 0.6,
              }}
              eventHandlers={{
                click: () => {
                  onCountrySelect(country.country);
                },
              }}
            >
              <Popup>
                <div className="p-2 min-w-[280px]">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                    <img
                      src={country.countryInfo.flag}
                      alt={country.country}
                      className="w-8 h-6 object-cover rounded"
                    />
                    <h3 className="font-bold text-lg text-gray-900">{country.country}</h3>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">✅ Active Cases:</span>
                      <span className="font-semibold text-orange-600">{formatNumber(country.active)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">💀 Deaths:</span>
                      <span className="font-semibold text-red-600">{formatNumber(country.deaths)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">🔄 Recovered:</span>
                      <span className="font-semibold text-green-600">{formatNumber(country.recovered)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">📊 Cases/Million:</span>
                      <span className="font-semibold text-blue-600">{formatNumber(country.casesPerOneMillion)}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">🏥 Tests Done:</span>
                      <span className="font-semibold text-purple-600">{formatNumber(country.tests)}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600">📅 Last Updated:</span>
                      <span className="font-semibold text-gray-700 text-xs">{formatDate(country.updated)}</span>
                    </div>

                    {country.todayCases > 0 && (
                      <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
                        <span className="text-orange-700">
                          📈 +{formatNumber(country.todayCases)} new cases today
                        </span>
                      </div>
                    )}

                    {country.critical > 0 && (
                      <div className="mt-1 p-2 bg-red-50 rounded text-xs">
                        <span className="text-red-700">
                          🚨 {formatNumber(country.critical)} critical cases
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onCountrySelect(country.country)}
                    className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    View Detailed Stats
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-[1000]">
        <h4 className="font-semibold text-xs text-gray-700 mb-2">Cases per Million</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-gray-600">&gt; 10,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-gray-600">1,000 - 10,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600">100 - 1,000</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-gray-600">&lt; 100</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">Marker size = total cases</p>
        </div>
      </div>
    </div>
  );
}
