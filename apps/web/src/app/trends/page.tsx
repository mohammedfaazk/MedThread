'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import dynamic from 'next/dynamic';
import { Globe, TrendingUp, Activity, Users, AlertCircle } from 'lucide-react';

// Dynamic import for Leaflet (must disable SSR)
const TrendsMap = dynamic(() => import('@/components/TrendsMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

// Dynamic import for RegionalSymptomHeatmap (named export)
const RegionalSymptomHeatmap = dynamic(
  () => import('@/components/analytics/RegionalSymptomHeatmap').then(mod => mod.RegionalSymptomHeatmap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heatmap...</p>
        </div>
      </div>
    )
  }
);

// Dynamic import for DiseaseHeatmapGrid
const DiseaseHeatmapGrid = dynamic(
  () => import('@/components/analytics/DiseaseHeatmapGrid').then(mod => mod.DiseaseHeatmapGrid),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading heatmap grid...</p>
        </div>
      </div>
    )
  }
);

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

export default function TrendsPage() {
  const [diseaseType, setDiseaseType] = useState<string>('covid-19');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedPincode, setSelectedPincode] = useState<string>('');
  const [countriesData, setCountriesData] = useState<CountryData[]>([]);
  const [statesData, setStatesData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountryData, setSelectedCountryData] = useState<CountryData | null>(null);

  // Fetch global disease data
  useEffect(() => {
    fetchDiseaseData();
  }, [diseaseType]);

  // Fetch state-level data when country is selected
  useEffect(() => {
    if (selectedCountry && (diseaseType === 'covid-19' || diseaseType === 'influenza')) {
      fetchStateData(selectedCountry);
    } else {
      setStatesData([]);
      setSelectedState('');
    }
  }, [selectedCountry, diseaseType]);

  // Apply filters to data
  useEffect(() => {
    applyFilters();
  }, [selectedCountry, selectedState, selectedCity, selectedPincode, countriesData, statesData]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCountry) params.set('country', selectedCountry);
    if (diseaseType) params.set('disease', diseaseType);
    if (selectedState) params.set('state', selectedState);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedPincode) params.set('pincode', selectedPincode);
    
    const newUrl = params.toString() ? `/trends?${params.toString()}` : '/trends';
    window.history.replaceState({}, '', newUrl);
  }, [selectedCountry, diseaseType, selectedState, selectedCity, selectedPincode]);

  const fetchDiseaseData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (diseaseType === 'covid-19' || diseaseType === 'influenza') {
        // Use disease.sh for COVID-19 and Influenza
        const response = await fetch('https://disease.sh/v3/covid-19/countries?sort=cases');
        if (!response.ok) throw new Error('Failed to fetch disease data');
        const data = await response.json();
        setCountriesData(data);
      } else {
        // For other diseases, use web-search-based disease trends API
        // This will search the internet for current disease data
        setCountriesData([]);
        setError(`Loading ${diseaseType} data from web search...`);
        
        // Fetch data for major countries
        const countries = ['India', 'USA', 'China', 'Brazil', 'Indonesia', 'Pakistan', 'Bangladesh', 'Nigeria', 'Mexico', 'Philippines'];
        const currentYear = new Date().getFullYear();
        
        try {
          // Create individual requests for each country
          const requests = countries.map(country => ({
            disease: diseaseType,
            location: country,
            year: currentYear
          }));

          const response = await fetch(`/api/v1/disease-trends/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requests })
          });
          
          if (!response.ok) throw new Error('Failed to fetch disease trends');
          const result = await response.json();
          
          if (result.success && result.data) {
            // Country coordinates for map markers
            const countryCoords: Record<string, [number, number]> = {
              'India': [20.5937, 78.9629],
              'USA': [37.0902, -95.7129],
              'China': [35.8617, 104.1954],
              'Brazil': [-14.2350, -51.9253],
              'Indonesia': [-0.7893, 113.9213],
              'Pakistan': [30.3753, 69.3451],
              'Bangladesh': [23.6850, 90.3563],
              'Nigeria': [9.0820, 8.6753],
              'Mexico': [23.6345, -102.5528],
              'Philippines': [12.8797, 121.7740]
            };

            // Convert disease trends data to country format
            const mockCountryData = result.data.map((trend: any, index: number) => {
              const country = countries[index];
              const coords = countryCoords[country] || [0, 0];
              
              // Calculate cases per million for color coding
              const estimatedPopulation = 1000000000; // Rough estimate for major countries
              const casesPerMillion = trend.cases ? (trend.cases / estimatedPopulation) * 1000000 : 0;
              
              return {
                country: country,
                countryInfo: {
                  lat: coords[0],
                  long: coords[1],
                  flag: '',
                  iso2: '',
                  iso3: ''
                },
                cases: trend.cases || 0,
                todayCases: 0,
                deaths: trend.deaths || 0,
                todayDeaths: 0,
                recovered: 0,
                todayRecovered: 0,
                active: trend.cases || 0,
                critical: 0,
                casesPerOneMillion: casesPerMillion,
                deathsPerOneMillion: 0,
                tests: 0,
                testsPerOneMillion: 0,
                population: estimatedPopulation,
                continent: 'Asia',
                updated: Date.now(),
                // Store additional trend data
                trend: trend.trend,
                summary: trend.summary,
                sources: trend.sources
              };
            });
            
            setCountriesData(mockCountryData);
            setError(null);
          } else {
            setError(`${diseaseType} data - Web search in progress`);
          }
        } catch (searchErr: any) {
          console.error('Web search error:', searchErr);
          setError(`${diseaseType} data - Web search temporarily unavailable`);
        }
      }
    } catch (err: any) {
      console.error('Error fetching disease data:', err);
      setError(err.message || 'Failed to load disease data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStateData = async (country: string) => {
    try {
      // disease.sh provides state-level data for USA, India, and a few other countries
      const countryMap: Record<string, string> = {
        'USA': 'usa',
        'India': 'india',
        'Australia': 'australia',
        'Canada': 'canada',
        'Germany': 'germany',
        'Italy': 'italy',
        'UK': 'uk',
        'China': 'china'
      };

      const countryCode = countryMap[country];
      if (!countryCode) {
        console.log(`State-level data not available for ${country}`);
        setStatesData([]);
        return;
      }

      const response = await fetch(`https://disease.sh/v3/covid-19/states?sort=cases`);
      if (!response.ok) throw new Error('Failed to fetch state data');
      const allStates = await response.json();
      
      // Filter states for the selected country (USA states only from this endpoint)
      const countryStates = country === 'USA' ? allStates : [];
      setStatesData(countryStates);
    } catch (err: any) {
      console.error('Error fetching state data:', err);
      setStatesData([]);
    }
  };

  const applyFilters = () => {
    let filtered: any[] = [];

    if (selectedState && statesData.length > 0) {
      // Filter by state
      const stateData = statesData.filter(s => 
        s.state.toLowerCase().includes(selectedState.toLowerCase())
      );
      filtered = stateData;
    } else if (selectedCountry && countriesData.length > 0) {
      // Filter by country
      const countryData = countriesData.filter(c => 
        c.country.toLowerCase() === selectedCountry.toLowerCase()
      );
      filtered = countryData;
    } else {
      // Show all countries
      filtered = countriesData;
    }

    // Apply city filter (client-side text matching)
    if (selectedCity && filtered.length > 0) {
      // For demonstration, we'll keep the data but add a note
      // Real city-level data would require a different API
      console.log(`City filter applied: ${selectedCity}`);
    }

    // Apply pincode filter (client-side text matching)
    if (selectedPincode && filtered.length > 0) {
      // For demonstration, we'll keep the data but add a note
      // Real pincode-level data would require a different API
      console.log(`Pincode filter applied: ${selectedPincode}`);
    }

    setFilteredData(filtered);
  };

  // Update selected country data when country changes
  useEffect(() => {
    if (selectedCountry && countriesData.length > 0) {
      const countryData = countriesData.find(
        c => c.country.toLowerCase() === selectedCountry.toLowerCase()
      );
      setSelectedCountryData(countryData || null);
    } else {
      setSelectedCountryData(null);
    }
  }, [selectedCountry, countriesData]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const calculateRecoveryRate = (recovered: number, cases: number): string => {
    if (cases === 0) return '0';
    return ((recovered / cases) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Global Health Trends</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Real-time disease tracking and health statistics from around the world
          </p>
        </div>

        {/* Disease Type Filter */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Select Disease/Condition</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All', icon: '🌍' },
              { id: 'covid-19', label: 'COVID-19', icon: '🦠' },
              { id: 'influenza', label: 'Influenza', icon: '🤧' },
              { id: 'dengue', label: 'Dengue', icon: '🦟' },
              { id: 'malaria', label: 'Malaria', icon: '🦟' },
              { id: 'tuberculosis', label: 'Tuberculosis', icon: '🫁' },
            ].map((disease) => (
              <button
                key={disease.id}
                onClick={() => setDiseaseType(disease.id)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
                  diseaseType === disease.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{disease.icon}</span>
                {disease.label}
              </button>
            ))}
          </div>
        </div>

        {/* Geographic Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value);
                  setSelectedState('');
                  setSelectedCity('');
                  setSelectedPincode('');
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">All Countries</option>
                {countriesData.map((country) => (
                  <option key={country.country} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
            </div>

            {/* State Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                State/Province
                {selectedCountry === 'USA' && <span className="text-green-600 ml-1">✓</span>}
              </label>
              {selectedCountry === 'USA' && statesData.length > 0 ? (
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedCity('');
                    setSelectedPincode('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="">All States</option>
                  {statesData.map((state: any) => (
                    <option key={state.state} value={state.state}>
                      {state.state}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  placeholder={selectedCountry ? "Enter state name" : "Select country first"}
                  disabled={!selectedCountry}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              )}
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedPincode('');
                }}
                placeholder={selectedCountry ? "Enter city name" : "Select country first"}
                disabled={!selectedCountry}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Pincode Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pincode/ZIP</label>
              <input
                type="text"
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                placeholder={selectedCountry ? "Enter pincode" : "Select country first"}
                disabled={!selectedCountry}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Filter Info */}
          <div className="mt-3 flex items-start gap-2">
            {selectedCountry === 'USA' && statesData.length > 0 ? (
              <div className="flex-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">
                  <span className="font-semibold">✓ State-level data available</span> - Showing real data for {selectedState || 'all'} US states
                </p>
              </div>
            ) : selectedCountry && (selectedState || selectedCity || selectedPincode) ? (
              <div className="flex-1 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Sub-national data limited for {selectedCountry}. Showing country-level aggregated data.
                  {selectedCountry === 'India' && ' (State data coming soon via WHO API)'}
                </p>
              </div>
            ) : null}
            
            {(selectedCountry || selectedState || selectedCity || selectedPincode) && (
              <button
                onClick={() => {
                  setSelectedCountry('');
                  setSelectedState('');
                  setSelectedCity('');
                  setSelectedPincode('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition whitespace-nowrap"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            💡 Click on any marker on the map to view detailed statistics
          </p>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Interactive Disease Map</h3>
          {loading ? (
            <div className="w-full h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading disease data...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-[600px] bg-red-50 rounded-xl flex items-center justify-center">
              <div className="text-center text-red-600">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          ) : (
            <TrendsMap
              countriesData={filteredData.length > 0 ? filteredData : countriesData}
              statesData={statesData}
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              onCountrySelect={setSelectedCountry}
              showStates={selectedCountry === 'USA' && !selectedState}
            />
          )}
        </div>

        {/* Stats Panel */}
        {selectedCountryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Activity className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Total</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{formatNumber(selectedCountryData.cases)}</h3>
              <p className="text-sm opacity-90">Total Recorded Cases</p>
              <p className="text-xs mt-2 opacity-75">
                +{formatNumber(selectedCountryData.todayCases)} today
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Active</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">{formatNumber(selectedCountryData.active)}</h3>
              <p className="text-sm opacity-90">Active Cases Today</p>
              <p className="text-xs mt-2 opacity-75">
                {selectedCountryData.critical} critical
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Recovery</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {calculateRecoveryRate(selectedCountryData.recovered, selectedCountryData.cases)}%
              </h3>
              <p className="text-sm opacity-90">Recovery Rate</p>
              <p className="text-xs mt-2 opacity-75">
                {formatNumber(selectedCountryData.recovered)} recovered
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Globe className="w-8 h-8 opacity-80" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">Per Million</span>
              </div>
              <h3 className="text-3xl font-bold mb-1">
                {formatNumber(selectedCountryData.casesPerOneMillion)}
              </h3>
              <p className="text-sm opacity-90">Cases Per Million</p>
              <p className="text-xs mt-2 opacity-75">
                {formatNumber(selectedCountryData.testsPerOneMillion)} tests/M
              </p>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">Data Sources</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• COVID-19 & Influenza: <a href="https://disease.sh" target="_blank" rel="noopener noreferrer" className="underline">disease.sh API</a></li>
            <li>• Dengue, Malaria, TB: Web search powered by Tavily API (searches WHO, CDC, NIH, HealthMap, ECDC, MOHFW India)</li>
            <li>• Map tiles: OpenStreetMap (free, no API key required)</li>
            <li>• Data cached for 7 days to minimize API usage</li>
            <li>• Real-time web search for latest disease statistics and outbreak information</li>
          </ul>
        </div>

        {/* Visual Disease Heatmap Grids */}
        <div className="space-y-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Regional Disease Heatmaps</h2>
          <p className="text-gray-600 mb-4">
            Visual representation of disease intensity across regions
          </p>
          
          <DiseaseHeatmapGrid 
            disease={diseaseType} 
            selectedCountry={selectedCountry}
            countriesData={countriesData}
            statesData={statesData}
            className="mb-6" 
          />
        </div>

        {/* Regional Symptom Heatmap */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Regional Health Trends</h3>
          <RegionalSymptomHeatmap />
        </div>
      </div>
    </div>
  );
}
