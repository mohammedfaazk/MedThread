'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, TrendingUp, Globe, AlertCircle, RefreshCw, MapPin, Info } from 'lucide-react';
import dynamic from 'next/dynamic';
import { DiseaseTooltip } from '@/components/DiseaseTooltip';
import { DISEASE_PREVALENCE } from '@/data/diseaseData';
import { fetchLiveDiseaseStats, fetchAllDiseaseStats, type LiveDiseaseStats } from '@/lib/diseaseDataFetcher';

// Dynamically import WorldMap to avoid SSR issues
const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading world map...</p>
      </div>
    </div>
  )
});

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

interface DiseaseData {
  disease: string;
  countries: string[];
  cases: number;
  description: string;
}

export default function TrendsPage() {
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [countries, setCountries] = useState<CountryData[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContinent, setSelectedContinent] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedDisease, setSelectedDisease] = useState('covid-19');
  const [selectedSymptom, setSelectedSymptom] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cases' | 'deaths' | 'recovered' | 'active'>('cases');
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [diseaseStats, setDiseaseStats] = useState<Map<string, LiveDiseaseStats> | null>(null);
  const [dataQuality, setDataQuality] = useState<'live' | 'recent' | 'estimated'>('estimated');
  const mapRef = useRef<HTMLDivElement>(null);

  const continents = ['all', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  const diseases = [
    { id: 'all', label: 'All Diseases', color: 'bg-gray-100 text-gray-800' },
    { id: 'covid-19', label: 'COVID-19', color: 'bg-blue-100 text-blue-800' },
    { id: 'influenza', label: 'Influenza', color: 'bg-purple-100 text-purple-800' },
    { id: 'dengue', label: 'Dengue', color: 'bg-orange-100 text-orange-800' },
    { id: 'malaria', label: 'Malaria', color: 'bg-green-100 text-green-800' },
  ];

  // Generate disease list from DISEASE_PREVALENCE keys
  const ALL_DISEASE_SYMPTOMS = Object.keys(DISEASE_PREVALENCE).sort();

  useEffect(() => {
    fetchData();
    fetchDiseaseStats();
  }, []);

  useEffect(() => {
    filterAndSortCountries();
  }, [countries, searchTerm, selectedContinent, selectedCountry, selectedSymptom, sortBy]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [globalRes, countriesRes] = await Promise.all([
        fetch('https://disease.sh/v3/covid-19/all'),
        fetch('https://disease.sh/v3/covid-19/countries?sort=cases')
      ]);
      
      if (globalRes.ok && countriesRes.ok) {
        const globalData = await globalRes.json();
        const countriesData = await countriesRes.json();
        setGlobalStats(globalData);
        setCountries(countriesData);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiseaseStats = async () => {
    try {
      // Fetch all disease statistics from WHO/CDC sources
      const statsMap = await fetchAllDiseaseStats();
      setDiseaseStats(statsMap);
      
      // Determine overall data quality
      let quality: 'live' | 'recent' | 'estimated' = 'live';
      statsMap.forEach(stat => {
        if (stat.dataQuality === 'estimated') quality = 'estimated';
        else if (stat.dataQuality === 'recent' && quality === 'live') quality = 'recent';
      });
      setDataQuality(quality);
    } catch (err) {
      console.error('Failed to fetch disease stats:', err);
    }
  };

  const filterAndSortCountries = () => {
    let filtered = [...countries];

    if (searchTerm) {
      filtered = filtered.filter(country =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedContinent !== 'all') {
      filtered = filtered.filter(country => country.continent === selectedContinent);
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(country => country.country === selectedCountry);
    }

    // Filter by disease - use real prevalence data
    if (selectedSymptom !== 'all') {
      const affectedCountries = DISEASE_PREVALENCE[selectedSymptom] || [];
      filtered = filtered.filter(country => 
        affectedCountries.some(c => 
          country.country.toLowerCase().includes(c.toLowerCase()) || 
          c.toLowerCase().includes(country.country.toLowerCase())
        )
      );
    }

    filtered.sort((a, b) => b[sortBy] - a[sortBy]);
    setFilteredCountries(filtered);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getSeverityColor = (casesPerMillion: number) => {
    if (casesPerMillion > 100000) return '#EF4444'; // Red
    if (casesPerMillion > 50000) return '#F97316'; // Orange
    if (casesPerMillion > 10000) return '#EAB308'; // Yellow
    return '#22C55E'; // Green
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  const recoveryRate = globalStats ? ((globalStats.recovered / globalStats.cases) * 100).toFixed(1) : '0';

  // Get current disease stats based on selection
  const getCurrentDiseaseStats = () => {
    if (!diseaseStats) return globalStats;
    
    if (selectedSymptom === 'all') {
      return globalStats;
    }
    
    const stats = diseaseStats.get(selectedSymptom);
    if (!stats) return globalStats;
    
    // Convert LiveDiseaseStats to format expected by UI
    return {
      cases: stats.globalCases,
      active: stats.activeCases,
      recovered: stats.globalRecovered,
      deaths: stats.globalDeaths,
      todayCases: 0,
      todayDeaths: 0,
      tests: 0,
      critical: 0,
      updated: new Date(stats.lastUpdated).getTime()
    };
  };

  const currentStats = getCurrentDiseaseStats();
  const currentDiseaseInfo = diseaseStats?.get(selectedSymptom) || null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <Globe className="w-10 h-10 text-blue-600" />
                Global Health Trends
              </h1>
              <p className="text-gray-600 mt-2">Real-time disease tracking and outbreak monitoring</p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Disease/Symptom Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Filter by Disease/Condition:</label>
            
            {/* Data Quality Indicator */}
            {currentDiseaseInfo && (
              <div className="flex items-center gap-2 text-xs">
                <div className={`px-3 py-1 rounded-full font-medium ${
                  currentDiseaseInfo.dataQuality === 'live' 
                    ? 'bg-green-100 text-green-800' 
                    : currentDiseaseInfo.dataQuality === 'recent'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {currentDiseaseInfo.dataQuality === 'live' && '🟢 Live Data'}
                  {currentDiseaseInfo.dataQuality === 'recent' && '🔵 Recent Data'}
                  {currentDiseaseInfo.dataQuality === 'estimated' && '⚪ Estimated'}
                </div>
                <span className="text-gray-500">
                  Source: {currentDiseaseInfo.source}
                </span>
                <span className="text-gray-400">
                  Updated: {new Date(currentDiseaseInfo.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSymptom('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedSymptom === 'all'
                  ? 'bg-blue-100 text-blue-800 ring-2 ring-offset-2 ring-blue-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Diseases
            </button>
            {ALL_DISEASE_SYMPTOMS.map(disease => (
              <button
                key={disease}
                onClick={() => setSelectedSymptom(disease)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedSymptom === disease
                    ? 'bg-purple-100 text-purple-800 ring-2 ring-offset-2 ring-purple-500'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {disease}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {selectedSymptom === 'all' 
              ? `Showing all regions with disease data (${filteredCountries.length} countries)` 
              : `Showing ${filteredCountries.length} regions where "${selectedSymptom}" is prevalent (based on WHO/CDC data)`}
          </p>
        </div>

        {/* Global Stats Cards */}
        {!isLoading && currentStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Total Recorded Cases</h3>
              <p className="text-3xl font-bold mb-1">{formatNumber(currentStats.cases || 0)}</p>
              <p className="text-sm opacity-75">
                {currentStats.todayCases ? `+${formatNumber(currentStats.todayCases)} new today` : 'Global estimate'}
              </p>
              <p className="text-xs opacity-75 mt-2">
                {selectedSymptom === 'all' ? 'COVID-19 (Live Data)' : `${selectedSymptom} (${currentDiseaseInfo?.source || 'WHO/CDC'})`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Active Cases</h3>
              <p className="text-3xl font-bold mb-1">{formatNumber(currentStats.active || 0)}</p>
              <p className="text-sm opacity-75">
                {currentStats.todayCases ? `+${formatNumber(currentStats.todayCases)} new today` : 'Currently affected'}
              </p>
              <p className="text-xs opacity-75 mt-2">
                {currentStats.critical ? `${formatNumber(currentStats.critical)} critical` : 'Worldwide'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">Recovery Rate</h3>
              <p className="text-3xl font-bold mb-1">
                {currentStats.cases && currentStats.recovered 
                  ? ((currentStats.recovered / currentStats.cases) * 100).toFixed(1) 
                  : recoveryRate}%
              </p>
              <p className="text-sm opacity-75">{formatNumber(currentStats.recovered || 0)} recovered</p>
              <p className="text-xs opacity-75 mt-2">
                {selectedSymptom === 'all' ? 'Global recovery data' : `${selectedSymptom} recovery`}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-sm font-medium opacity-90 mb-2">
                {currentStats.tests ? 'Tests Conducted' : 'Deaths Reported'}
              </h3>
              <p className="text-3xl font-bold mb-1">
                {currentStats.tests 
                  ? formatNumber(currentStats.tests)
                  : formatNumber(currentStats.deaths || 0)}
              </p>
              <p className="text-sm opacity-75">
                {currentStats.tests 
                  ? `${formatNumber(currentStats.testsPerOneMillion || 0)} per million`
                  : `${currentStats.todayDeaths ? `+${formatNumber(currentStats.todayDeaths)} today` : 'Total fatalities'}`}
              </p>
              <p className="text-xs opacity-75 mt-2">
                {currentStats.tests ? 'Total tests performed' : 'WHO/CDC data'}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Country/Region:
              </label>
              <select 
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">🌍 Global (All Countries)</option>
                {countries.slice(0, 50).map(country => (
                  <option key={country.countryInfo.iso2} value={country.country}>
                    {country.country}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {selectedCountry === 'all' 
                  ? 'Showing global data from all countries' 
                  : `Showing data for ${selectedCountry}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Continent:
              </label>
              <select
                value={selectedContinent}
                onChange={(e) => setSelectedContinent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {continents.map(continent => (
                  <option key={continent} value={continent}>
                    {continent === 'all' ? '🌍 All Continents' : continent}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="cases">Sort by Cases</option>
              <option value="deaths">Sort by Deaths</option>
              <option value="recovered">Sort by Recovered</option>
              <option value="active">Sort by Active</option>
            </select>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            Interactive Disease Map
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Hover over regions to see detailed statistics. Circle size represents total cases, color indicates severity.
          </p>

          {/* Map Legend - Disease-Specific */}
          <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Map Legend
                {selectedSymptom !== 'all' && (
                  <span className="text-xs font-normal text-gray-600">
                    (Showing: {selectedSymptom})
                  </span>
                )}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                <span className="text-gray-700 text-xs">Very High Risk</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span className="text-gray-700 text-xs">High Risk</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span className="text-gray-700 text-xs">Moderate Risk</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-gray-700 text-xs">Low Risk</span>
              </div>
            </div>

            {selectedSymptom !== 'all' && (
              <div className="mt-3 p-2 bg-white rounded text-xs text-gray-600">
                💡 <span className="font-medium">Tip:</span> Hover over any region to see detailed {selectedSymptom} statistics including symptoms, risk factors, and seasonality
              </div>
            )}
          </div>

          {/* Map Container - Real World Map */}
          <div 
            ref={mapRef}
            className="relative w-full h-96 rounded-lg overflow-hidden border-2 border-blue-200"
            onMouseMove={handleMouseMove}
          >
            <WorldMap 
              data={filteredCountries}
              onCountryHover={setHoveredCountry}
              selectedSymptom={selectedSymptom}
            />

            {/* Hover Tooltip - Disease-Specific Data */}
            {hoveredCountry && (
              <DiseaseTooltip
                country={hoveredCountry}
                selectedDisease={selectedSymptom}
                position={mousePosition}
              />
            )}
          </div>
        </div>

        {/* Data Attribution */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            📊 Data Sources & Accuracy
          </h3>
          <div className="space-y-3 text-sm text-blue-800">
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium mb-1">🟢 Live Data (Real-time updates)</p>
              <ul className="ml-4 space-y-1">
                <li>• COVID-19: <a href="https://disease.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">disease.sh API</a> (Johns Hopkins CSSE, updated every 10 minutes)</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-3">
              <p className="font-medium mb-1">🔵 Recent Official Data (2023-2024)</p>
              <ul className="ml-4 space-y-1">
                <li>• Malaria: WHO World Malaria Report 2023</li>
                <li>• Tuberculosis: WHO Global Tuberculosis Report 2023</li>
                <li>• Dengue, Influenza, Cholera: WHO Fact Sheets 2023</li>
                <li>• Measles, Typhoid, Yellow Fever: WHO/CDC Reports 2023</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-3">
              <p className="font-medium mb-1">⚪ Estimated Data</p>
              <ul className="ml-4 space-y-1">
                <li>• Common Cold, Bronchitis: CDC estimates (annual averages)</li>
                <li>• Country-specific breakdowns: Based on WHO regional data</li>
              </ul>
            </div>

            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-900 text-xs">
                ⚠️ <span className="font-medium">Note:</span> Disease statistics are complex and vary by reporting methods. 
                Live data is only available for COVID-19. Other diseases use the most recent official WHO/CDC reports. 
                Actual case numbers may be higher due to underreporting in many regions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

