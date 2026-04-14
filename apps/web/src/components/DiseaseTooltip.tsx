'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Activity, Droplet, Wind, Calendar, Loader2 } from 'lucide-react';
import { getDiseaseDataForCountry, countryHasDisease, getDiseasesForCountry } from '@/data/diseaseData';
import { fetchRegionalDiseaseData, type RegionalDiseaseData } from '@/lib/liveRegionalDataFetcher';

interface CountryData {
  country: string;
  countryInfo: {
    flag: string;
  };
  continent: string;
  population: number;
  cases?: number;
  deaths?: number;
  recovered?: number;
  active?: number;
}

interface DiseaseTooltipProps {
  country: CountryData;
  selectedDisease: string;
  position: { x: number; y: number };
}

export const DiseaseTooltip: React.FC<DiseaseTooltipProps> = ({ country, selectedDisease, position }) => {
  const [liveData, setLiveData] = useState<RegionalDiseaseData | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(false);

  // Fetch live regional data when disease is selected
  useEffect(() => {
    if (selectedDisease && selectedDisease !== 'all') {
      setIsLoadingLive(true);
      fetchRegionalDiseaseData(country.country, selectedDisease)
        .then(data => {
          setLiveData(data);
          setIsLoadingLive(false);
        })
        .catch(err => {
          console.error('Failed to fetch live data:', err);
          setIsLoadingLive(false);
        });
    } else {
      setLiveData(null);
    }
  }, [country.country, selectedDisease]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  const getPrevalenceColor = (prevalence: string) => {
    switch (prevalence) {
      case 'Very High': return 'text-red-600 bg-red-50';
      case 'High': return 'text-orange-600 bg-orange-50';
      case 'Moderate': return 'text-yellow-600 bg-yellow-50';
      case 'Low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Check if showing all diseases or specific disease
  const showingAllDiseases = selectedDisease === 'all';
  
  // Get disease-specific data
  const diseaseData = selectedDisease !== 'all' 
    ? getDiseaseDataForCountry(country.country, selectedDisease)
    : null;

  // Check if country has the selected disease
  const hasDisease = selectedDisease !== 'all' 
    ? countryHasDisease(country.country, selectedDisease)
    : true;

  // Get all diseases for this country
  const allDiseases = getDiseasesForCountry(country.country);

  return (
    <div
      className="fixed z-50 bg-white rounded-xl shadow-2xl border-2 border-blue-500 max-w-md pointer-events-none"
      style={{
        left: `${position.x + 20}px`,
        top: `${position.y + 20}px`,
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-t-xl">
        <div className="flex items-center gap-3">
          <img
            src={country.countryInfo.flag}
            alt={country.country}
            className="w-10 h-7 object-cover rounded shadow-md"
          />
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg">{country.country}</h3>
            <p className="text-xs text-blue-100">{country.continent} • Pop: {formatNumber(country.population)}</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Disease-Specific Data */}
        {!showingAllDiseases && hasDisease ? (
          <div className="space-y-3">
            {/* Disease Name with Live Data Indicator */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" />
                {selectedDisease}
                {isLoadingLive && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
              </h4>
              {diseaseData && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPrevalenceColor(diseaseData.prevalence)}`}>
                  {diseaseData.prevalence} Prevalence
                </span>
              )}
            </div>

            {/* Live Regional Statistics */}
            {liveData && liveData.cases > 0 ? (
              <>
                {/* Data Quality Badge */}
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded-full font-medium ${
                    liveData.dataQuality === 'live' 
                      ? 'bg-green-100 text-green-800' 
                      : liveData.dataQuality === 'recent'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {liveData.dataQuality === 'live' && '🟢 Live Data'}
                    {liveData.dataQuality === 'recent' && '🔵 Recent Data'}
                    {liveData.dataQuality === 'estimated' && '⚪ Estimated'}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(liveData.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {/* Key Statistics - Live Data */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Total Cases</p>
                    <p className="text-lg font-bold text-blue-600">{formatNumber(liveData.cases)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Cases/Million</p>
                    <p className="text-lg font-bold text-purple-600">{formatNumber(liveData.casesPerMillion)}</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Active Cases</p>
                    <p className="text-lg font-bold text-orange-600">{formatNumber(liveData.active)}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Recovered</p>
                    <p className="text-lg font-bold text-green-600">{formatNumber(liveData.recovered)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Deaths</p>
                    <p className="text-lg font-bold text-red-600">{formatNumber(liveData.deaths)}</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-gray-600 mb-1">Mortality Rate</p>
                    <p className="text-lg font-bold text-red-600">{liveData.mortalityRate.toFixed(2)}%</p>
                  </div>
                </div>

                {/* Data Source */}
                <div className="bg-gray-50 rounded-lg p-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Source:</span> {liveData.source}
                  </p>
                </div>
              </>
            ) : isLoadingLive ? (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Fetching live data...</p>
              </div>
            ) : null}

            {/* Symptoms and Risk Factors from Static Data */}
            {diseaseData && (
              <>
                {/* Common Symptoms */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <Droplet className="w-3 h-3" />
                    Common Symptoms:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {diseaseData.symptoms.map((symptom, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md">
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk Factors */}
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Risk Factors:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {diseaseData.riskFactors.map((factor, idx) => (
                      <span key={idx} className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-md">
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Seasonality */}
                {diseaseData.seasonality && (
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Seasonality:
                    </p>
                    <p className="text-xs text-gray-600">{diseaseData.seasonality}</p>
                  </div>
                )}
              </>
            )}
          </div>
        ) : !showingAllDiseases && !hasDisease ? (
          // Disease not prevalent in this country
          <div className="text-center py-4">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600">{selectedDisease}</p>
            <p className="text-xs text-gray-500 mt-1">Not prevalent in {country.country}</p>
            <div className="mt-3 p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700">✓ Low to no reported cases</p>
            </div>
          </div>
        ) : (
          // Showing all diseases
          <div className="space-y-3">
            <div className="pb-2 border-b border-gray-200">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Disease Overview
              </h4>
            </div>

            {allDiseases.length > 0 ? (
              <>
                <div>
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Prevalent Diseases ({allDiseases.length}):
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {allDiseases.slice(0, 8).map((disease, idx) => (
                      <span key={idx} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md">
                        {disease}
                      </span>
                    ))}
                    {allDiseases.length > 8 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                        +{allDiseases.length - 8} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600">
                    💡 <span className="font-medium">Tip:</span> Select a specific disease above to see detailed statistics for this region
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No major disease outbreaks reported</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
