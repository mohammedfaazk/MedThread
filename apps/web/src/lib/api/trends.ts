import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface DiseaseStats {
  disease: string;
  globalCases: number;
  globalDeaths: number;
  recentCases: number;
  affectedCountries: number;
  lastUpdated: string;
  sources: string[];
  summary: string;
}

export interface CountryData {
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

export interface CountryDiseaseData {
  country: string;
  cases: number;
  deaths: number;
  recentCases: number;
  prevalence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lat: number;
  lng: number;
  lastUpdated: string;
  sources: string[];
}

/**
 * Get statistics for a specific disease using Tavily API
 */
export async function getDiseaseStatistics(disease: string): Promise<DiseaseStats> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/disease-stats`, {
      params: { disease }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching disease statistics:', error);
    throw error;
  }
}

/**
 * Get statistics for multiple diseases
 */
export async function getMultipleDiseaseStatistics(): Promise<Record<string, DiseaseStats>> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/multiple-diseases`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching multiple disease statistics:', error);
    throw error;
  }
}

/**
 * Get country-specific disease data
 */
export async function getCountryDiseaseData(disease: string, country?: string): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/country-data`, {
      params: { disease, country }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching country disease data:', error);
    throw error;
  }
}

/**
 * Get geographic distribution of disease
 */
export async function getDiseaseGeographicData(disease: string): Promise<CountryDiseaseData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/geographic-data`, {
      params: { disease }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching geographic data:', error);
    throw error;
  }
}

/**
 * Get all countries COVID-19 data
 */
export async function getAllCountriesCovidData(): Promise<CountryData[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/covid/countries`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching all countries COVID data:', error);
    throw error;
  }
}

/**
 * Get US states COVID-19 data
 */
export async function getUSStatesCovidData(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/covid/states`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching US states COVID data:', error);
    throw error;
  }
}

/**
 * Get comprehensive trends data
 */
export async function getComprehensiveTrends(disease: string = 'all'): Promise<any> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/v1/trends/comprehensive`, {
      params: { disease }
    });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching comprehensive trends:', error);
    throw error;
  }
}
