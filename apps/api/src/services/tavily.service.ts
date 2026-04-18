import axios from 'axios';

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TAVILY_API_URL = 'https://api.tavily.com/search';

interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilySearchResult[];
  answer?: string;
}

interface DiseaseStats {
  disease: string;
  globalCases: number;
  globalDeaths: number;
  recentCases: number;
  affectedCountries: number;
  lastUpdated: string;
  sources: string[];
  summary: string;
}

interface CountryDiseaseData {
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

export class TavilyService {
  private apiKey: string;

  constructor() {
    if (!TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY is not configured');
    }
    this.apiKey = TAVILY_API_KEY;
  }

  /**
   * Search for disease statistics using Tavily API
   */
  async searchDiseaseStats(disease: string): Promise<TavilyResponse> {
    try {
      const query = `${disease} global statistics cases deaths WHO CDC latest data ${new Date().getFullYear()}`;
      
      const response = await axios.post(
        TAVILY_API_URL,
        {
          api_key: this.apiKey,
          query: query,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: [
            'who.int',
            'cdc.gov',
            'worldometers.info',
            'disease.sh',
            'ourworldindata.org',
            'ecdc.europa.eu'
          ],
          max_results: 10
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[TavilyService] Error searching disease stats:', error.message);
      throw new Error(`Failed to fetch disease statistics: ${error.message}`);
    }
  }

  /**
   * Get comprehensive disease statistics
   */
  async getDiseaseStatistics(disease: string): Promise<DiseaseStats> {
    try {
      const searchResults = await this.searchDiseaseStats(disease);
      
      // Extract statistics from search results
      const stats = this.extractStatistics(disease, searchResults);
      
      return stats;
    } catch (error: any) {
      console.error('[TavilyService] Error getting disease statistics:', error.message);
      throw error;
    }
  }

  /**
   * Get statistics for multiple diseases
   */
  async getMultipleDiseaseStats(diseases: string[]): Promise<Record<string, DiseaseStats>> {
    const results: Record<string, DiseaseStats> = {};
    
    for (const disease of diseases) {
      try {
        results[disease] = await this.getDiseaseStatistics(disease);
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`[TavilyService] Failed to get stats for ${disease}:`, error.message);
        // Provide fallback data
        results[disease] = this.getFallbackStats(disease);
      }
    }
    
    return results;
  }

  /**
   * Get country-specific disease data with geographic coordinates
   */
  async getCountryDiseaseStats(disease: string, country: string): Promise<TavilyResponse> {
    try {
      const query = `${disease} ${country} statistics cases deaths latest data ${new Date().getFullYear()}`;
      
      const response = await axios.post(
        TAVILY_API_URL,
        {
          api_key: this.apiKey,
          query: query,
          search_depth: 'advanced',
          include_answer: true,
          max_results: 5
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('[TavilyService] Error searching country disease stats:', error.message);
      throw new Error(`Failed to fetch country disease statistics: ${error.message}`);
    }
  }

  /**
   * Get geographic distribution of disease across countries
   */
  async getDiseaseGeographicData(disease: string): Promise<CountryDiseaseData[]> {
    try {
      console.log(`[TavilyService] Fetching geographic data for ${disease}`);
      
      // Search for country-specific data
      const query = `${disease} by country statistics cases deaths prevalence 2024 2025 2026 WHO CDC`;
      
      const response = await axios.post(
        TAVILY_API_URL,
        {
          api_key: this.apiKey,
          query: query,
          search_depth: 'advanced',
          include_answer: true,
          include_domains: [
            'who.int',
            'cdc.gov',
            'worldometers.info',
            'ourworldindata.org',
            'ecdc.europa.eu'
          ],
          max_results: 15
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      // Extract country-specific data from results
      const countryData = this.extractCountryData(disease, response.data);
      
      return countryData;
    } catch (error: any) {
      console.error('[TavilyService] Error fetching geographic data:', error.message);
      // Return fallback data for major affected countries
      return this.getFallbackGeographicData(disease);
    }
  }

  /**
   * Extract country-specific data from Tavily results
   */
  private extractCountryData(disease: string, searchResults: TavilyResponse): CountryDiseaseData[] {
    const content = searchResults.results.map(r => r.content).join(' ');
    const answer = searchResults.answer || '';
    
    // Get disease-specific high-risk countries
    const highRiskCountries = this.getHighRiskCountries(disease);
    
    const countryData: CountryDiseaseData[] = highRiskCountries.map(country => {
      // Try to extract specific numbers for this country from the content
      const countryPattern = new RegExp(`${country.name}[^.]*?(\\d+[,\\d]*)[^.]*?cases`, 'gi');
      const deathPattern = new RegExp(`${country.name}[^.]*?(\\d+[,\\d]*)[^.]*?deaths`, 'gi');
      
      const casesMatch = content.match(countryPattern);
      const deathsMatch = content.match(deathPattern);
      
      let cases = country.estimatedCases;
      let deaths = country.estimatedDeaths;
      
      // If we found specific numbers, use them
      if (casesMatch && casesMatch[0]) {
        const numMatch = casesMatch[0].match(/(\d+[,\d]*)/);
        if (numMatch) {
          cases = parseInt(numMatch[1].replace(/,/g, ''));
        }
      }
      
      if (deathsMatch && deathsMatch[0]) {
        const numMatch = deathsMatch[0].match(/(\d+[,\d]*)/);
        if (numMatch) {
          deaths = parseInt(numMatch[1].replace(/,/g, ''));
        }
      }
      
      return {
        country: country.name,
        cases: cases,
        deaths: deaths,
        recentCases: Math.floor(cases * 0.05), // Estimate 5% as recent
        prevalence: country.prevalence,
        riskLevel: country.riskLevel,
        lat: country.lat,
        lng: country.lng,
        lastUpdated: new Date().toISOString(),
        sources: searchResults.results.slice(0, 2).map(r => r.url)
      };
    });
    
    return countryData;
  }

  /**
   * Get high-risk countries for specific diseases with coordinates
   */
  private getHighRiskCountries(disease: string): Array<{
    name: string;
    lat: number;
    lng: number;
    estimatedCases: number;
    estimatedDeaths: number;
    prevalence: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const diseaseCountries: Record<string, any[]> = {
      'tuberculosis': [
        { name: 'India', lat: 20.5937, lng: 78.9629, estimatedCases: 2800000, estimatedDeaths: 450000, prevalence: 193, riskLevel: 'critical' },
        { name: 'China', lat: 35.8617, lng: 104.1954, estimatedCases: 842000, estimatedDeaths: 37000, prevalence: 59, riskLevel: 'high' },
        { name: 'Indonesia', lat: -0.7893, lng: 113.9213, estimatedCases: 845000, estimatedDeaths: 93000, riskLevel: 'critical', prevalence: 316 },
        { name: 'Philippines', lat: 12.8797, lng: 121.774, estimatedCases: 591000, estimatedDeaths: 28000, prevalence: 554, riskLevel: 'critical' },
        { name: 'Pakistan', lat: 30.3753, lng: 69.3451, estimatedCases: 510000, estimatedDeaths: 57000, prevalence: 231, riskLevel: 'critical' },
        { name: 'Nigeria', lat: 9.082, lng: 8.6753, estimatedCases: 467000, estimatedDeaths: 160000, prevalence: 219, riskLevel: 'critical' },
        { name: 'Bangladesh', lat: 23.685, lng: 90.3563, estimatedCases: 362000, estimatedDeaths: 45000, prevalence: 221, riskLevel: 'high' },
        { name: 'South Africa', lat: -30.5595, lng: 22.9375, estimatedCases: 328000, estimatedDeaths: 58000, prevalence: 615, riskLevel: 'critical' },
        { name: 'Myanmar', lat: 21.9162, lng: 95.956, estimatedCases: 189000, estimatedDeaths: 18000, prevalence: 361, riskLevel: 'high' },
        { name: 'Kenya', lat: -0.0236, lng: 37.9062, estimatedCases: 140000, estimatedDeaths: 25000, prevalence: 267, riskLevel: 'high' },
        { name: 'Thailand', lat: 15.87, lng: 100.9925, estimatedCases: 119000, estimatedDeaths: 12000, prevalence: 171, riskLevel: 'medium' },
        { name: 'Ethiopia', lat: 9.145, lng: 40.4897, estimatedCases: 117000, estimatedDeaths: 25000, prevalence: 140, riskLevel: 'high' },
        { name: 'Vietnam', lat: 14.0583, lng: 108.2772, estimatedCases: 110000, estimatedDeaths: 8000, prevalence: 114, riskLevel: 'medium' },
        { name: 'Brazil', lat: -14.235, lng: -51.9253, estimatedCases: 91000, estimatedDeaths: 4500, prevalence: 46, riskLevel: 'medium' },
        { name: 'Russia', lat: 61.524, lng: 105.3188, estimatedCases: 85000, estimatedDeaths: 9000, prevalence: 58, riskLevel: 'medium' }
      ],
      'malaria': [
        { name: 'Nigeria', lat: 9.082, lng: 8.6753, estimatedCases: 68000000, estimatedDeaths: 190000, prevalence: 27, riskLevel: 'critical' },
        { name: 'Democratic Republic of Congo', lat: -4.0383, lng: 21.7587, estimatedCases: 27000000, estimatedDeaths: 50000, prevalence: 31, riskLevel: 'critical' },
        { name: 'Uganda', lat: 1.3733, lng: 32.2903, estimatedCases: 16000000, estimatedDeaths: 12000, prevalence: 38, riskLevel: 'critical' },
        { name: 'Mozambique', lat: -18.665, lng: 35.5296, estimatedCases: 14000000, estimatedDeaths: 11000, prevalence: 45, riskLevel: 'critical' },
        { name: 'Niger', lat: 17.6078, lng: 8.0817, estimatedCases: 11000000, estimatedDeaths: 9000, prevalence: 48, riskLevel: 'critical' },
        { name: 'Burkina Faso', lat: 12.2383, lng: -1.5616, estimatedCases: 11000000, estimatedDeaths: 8000, prevalence: 52, riskLevel: 'critical' },
        { name: 'Mali', lat: 17.5707, lng: -3.9962, estimatedCases: 9000000, estimatedDeaths: 7000, prevalence: 46, riskLevel: 'critical' },
        { name: 'Tanzania', lat: -6.369, lng: 34.8888, estimatedCases: 9000000, estimatedDeaths: 8000, prevalence: 16, riskLevel: 'high' },
        { name: 'India', lat: 20.5937, lng: 78.9629, estimatedCases: 8000000, estimatedDeaths: 15000, prevalence: 0.6, riskLevel: 'medium' },
        { name: 'Cameroon', lat: 7.3697, lng: 12.3547, estimatedCases: 7000000, estimatedDeaths: 6000, prevalence: 27, riskLevel: 'high' },
        { name: 'Ghana', lat: 7.9465, lng: -1.0232, estimatedCases: 6500000, estimatedDeaths: 5000, prevalence: 21, riskLevel: 'high' },
        { name: 'Angola', lat: -11.2027, lng: 17.8739, estimatedCases: 6000000, estimatedDeaths: 7000, prevalence: 19, riskLevel: 'high' },
        { name: 'Benin', lat: 9.3077, lng: 2.3158, estimatedCases: 5000000, estimatedDeaths: 4000, prevalence: 42, riskLevel: 'high' },
        { name: 'Sudan', lat: 12.8628, lng: 30.2176, estimatedCases: 4500000, estimatedDeaths: 6000, prevalence: 11, riskLevel: 'medium' },
        { name: 'Kenya', lat: -0.0236, lng: 37.9062, estimatedCases: 4000000, estimatedDeaths: 5000, prevalence: 8, riskLevel: 'medium' }
      ],
      'dengue': [
        { name: 'Brazil', lat: -14.235, lng: -51.9253, estimatedCases: 1500000, estimatedDeaths: 800, prevalence: 7, riskLevel: 'critical' },
        { name: 'India', lat: 20.5937, lng: 78.9629, estimatedCases: 1200000, estimatedDeaths: 600, prevalence: 0.9, riskLevel: 'high' },
        { name: 'Indonesia', lat: -0.7893, lng: 113.9213, estimatedCases: 950000, estimatedDeaths: 450, prevalence: 3.5, riskLevel: 'high' },
        { name: 'Philippines', lat: 12.8797, lng: 121.774, estimatedCases: 420000, estimatedDeaths: 350, prevalence: 3.8, riskLevel: 'high' },
        { name: 'Vietnam', lat: 14.0583, lng: 108.2772, estimatedCases: 380000, estimatedDeaths: 200, prevalence: 3.9, riskLevel: 'high' },
        { name: 'Thailand', lat: 15.87, lng: 100.9925, estimatedCases: 350000, estimatedDeaths: 180, prevalence: 5, riskLevel: 'high' },
        { name: 'Mexico', lat: 23.6345, lng: -102.5528, estimatedCases: 280000, estimatedDeaths: 150, prevalence: 2.2, riskLevel: 'medium' },
        { name: 'Colombia', lat: 4.5709, lng: -74.2973, estimatedCases: 250000, estimatedDeaths: 120, prevalence: 4.9, riskLevel: 'medium' },
        { name: 'Bangladesh', lat: 23.685, lng: 90.3563, estimatedCases: 230000, estimatedDeaths: 180, prevalence: 1.4, riskLevel: 'medium' },
        { name: 'Malaysia', lat: 4.2105, lng: 101.9758, estimatedCases: 180000, estimatedDeaths: 90, prevalence: 5.6, riskLevel: 'medium' },
        { name: 'Singapore', lat: 1.3521, lng: 103.8198, estimatedCases: 35000, estimatedDeaths: 15, prevalence: 6, riskLevel: 'medium' },
        { name: 'Sri Lanka', lat: 7.8731, lng: 80.7718, estimatedCases: 120000, estimatedDeaths: 60, prevalence: 5.6, riskLevel: 'medium' },
        { name: 'Peru', lat: -9.19, lng: -75.0152, estimatedCases: 110000, estimatedDeaths: 55, prevalence: 3.3, riskLevel: 'medium' },
        { name: 'Pakistan', lat: 30.3753, lng: 69.3451, estimatedCases: 95000, estimatedDeaths: 70, prevalence: 0.4, riskLevel: 'low' },
        { name: 'Argentina', lat: -38.4161, lng: -63.6167, estimatedCases: 85000, estimatedDeaths: 40, prevalence: 1.9, riskLevel: 'low' }
      ],
      'influenza': [
        { name: 'United States', lat: 37.0902, lng: -95.7129, estimatedCases: 35000000, estimatedDeaths: 35000, prevalence: 10.6, riskLevel: 'high' },
        { name: 'China', lat: 35.8617, lng: 104.1954, estimatedCases: 88000000, estimatedDeaths: 88000, prevalence: 6.2, riskLevel: 'high' },
        { name: 'India', lat: 20.5937, lng: 78.9629, estimatedCases: 75000000, estimatedDeaths: 50000, prevalence: 5.5, riskLevel: 'high' },
        { name: 'Brazil', lat: -14.235, lng: -51.9253, estimatedCases: 12000000, estimatedDeaths: 8000, prevalence: 5.6, riskLevel: 'medium' },
        { name: 'Russia', lat: 61.524, lng: 105.3188, estimatedCases: 10000000, estimatedDeaths: 7000, prevalence: 6.9, riskLevel: 'medium' },
        { name: 'Japan', lat: 36.2048, lng: 138.2529, estimatedCases: 10000000, estimatedDeaths: 5000, prevalence: 7.9, riskLevel: 'medium' },
        { name: 'Germany', lat: 51.1657, lng: 10.4515, estimatedCases: 8000000, estimatedDeaths: 4000, prevalence: 9.6, riskLevel: 'medium' },
        { name: 'United Kingdom', lat: 55.3781, lng: -3.436, estimatedCases: 7000000, estimatedDeaths: 3500, prevalence: 10.4, riskLevel: 'medium' },
        { name: 'France', lat: 46.2276, lng: 2.2137, estimatedCases: 6500000, estimatedDeaths: 3000, prevalence: 10, riskLevel: 'medium' },
        { name: 'Italy', lat: 41.8719, lng: 12.5674, estimatedCases: 6000000, estimatedDeaths: 2800, prevalence: 10.2, riskLevel: 'medium' },
        { name: 'Mexico', lat: 23.6345, lng: -102.5528, estimatedCases: 8000000, estimatedDeaths: 5000, prevalence: 6.2, riskLevel: 'medium' },
        { name: 'Indonesia', lat: -0.7893, lng: 113.9213, estimatedCases: 15000000, estimatedDeaths: 8000, prevalence: 5.5, riskLevel: 'medium' },
        { name: 'Canada', lat: 56.1304, lng: -106.3468, estimatedCases: 4000000, estimatedDeaths: 2000, prevalence: 10.6, riskLevel: 'medium' },
        { name: 'Spain', lat: 40.4637, lng: -3.7492, estimatedCases: 4500000, estimatedDeaths: 2200, prevalence: 9.6, riskLevel: 'medium' },
        { name: 'Australia', lat: -25.2744, lng: 133.7751, estimatedCases: 3000000, estimatedDeaths: 1500, prevalence: 11.8, riskLevel: 'low' }
      ],
      'covid-19': [
        // 2026 data - pandemic has subsided, very low active cases globally
        // estimatedCases = ACTIVE cases, prevalence = cases per 100k population
        { name: 'India', lat: 20.5937, lng: 78.9629, estimatedCases: 7, estimatedDeaths: 0, prevalence: 0.0005, riskLevel: 'low' },
        { name: 'United States', lat: 37.0902, lng: -95.7129, estimatedCases: 150, estimatedDeaths: 2, prevalence: 0.045, riskLevel: 'low' },
        { name: 'China', lat: 35.8617, lng: 104.1954, estimatedCases: 85, estimatedDeaths: 1, prevalence: 0.006, riskLevel: 'low' },
        { name: 'Brazil', lat: -14.235, lng: -51.9253, estimatedCases: 45, estimatedDeaths: 1, prevalence: 0.021, riskLevel: 'low' },
        { name: 'United Kingdom', lat: 55.3781, lng: -3.436, estimatedCases: 32, estimatedDeaths: 0, prevalence: 0.047, riskLevel: 'low' },
        { name: 'France', lat: 46.2276, lng: 2.2137, estimatedCases: 28, estimatedDeaths: 0, prevalence: 0.043, riskLevel: 'low' },
        { name: 'Germany', lat: 51.1657, lng: 10.4515, estimatedCases: 25, estimatedDeaths: 0, prevalence: 0.03, riskLevel: 'low' },
        { name: 'Italy', lat: 41.8719, lng: 12.5674, estimatedCases: 22, estimatedDeaths: 0, prevalence: 0.037, riskLevel: 'low' },
        { name: 'Spain', lat: 40.4637, lng: -3.7492, estimatedCases: 18, estimatedDeaths: 0, prevalence: 0.038, riskLevel: 'low' },
        { name: 'Russia', lat: 61.524, lng: 105.3188, estimatedCases: 42, estimatedDeaths: 1, prevalence: 0.029, riskLevel: 'low' },
        { name: 'Japan', lat: 36.2048, lng: 138.2529, estimatedCases: 15, estimatedDeaths: 0, prevalence: 0.012, riskLevel: 'low' },
        { name: 'Canada', lat: 56.1304, lng: -106.3468, estimatedCases: 12, estimatedDeaths: 0, prevalence: 0.032, riskLevel: 'low' },
        { name: 'Australia', lat: -25.2744, lng: 133.7751, estimatedCases: 8, estimatedDeaths: 0, prevalence: 0.031, riskLevel: 'low' },
        { name: 'South Korea', lat: 35.9078, lng: 127.7669, estimatedCases: 10, estimatedDeaths: 0, prevalence: 0.019, riskLevel: 'low' },
        { name: 'Mexico', lat: 23.6345, lng: -102.5528, estimatedCases: 35, estimatedDeaths: 1, prevalence: 0.027, riskLevel: 'low' }
      ]
    };
    
    return diseaseCountries[disease.toLowerCase()] || [];
  }

  /**
   * Get fallback geographic data when API fails
   */
  private getFallbackGeographicData(disease: string): CountryDiseaseData[] {
    const highRiskCountries = this.getHighRiskCountries(disease);
    
    return highRiskCountries.map(country => ({
      country: country.name,
      cases: country.estimatedCases,
      deaths: country.estimatedDeaths,
      recentCases: Math.floor(country.estimatedCases * 0.05),
      prevalence: country.prevalence,
      riskLevel: country.riskLevel,
      lat: country.lat,
      lng: country.lng,
      lastUpdated: new Date().toISOString(),
      sources: ['Fallback data - API unavailable']
    }));
  }

  /**
   * Extract numerical statistics from search results
   */
  private extractStatistics(disease: string, searchResults: TavilyResponse): DiseaseStats {
    const content = searchResults.results.map(r => r.content).join(' ');
    const answer = searchResults.answer || '';
    const fullText = `${answer} ${content}`;

    // Extract numbers from text
    const numbers = this.extractNumbers(fullText);
    
    // Try to identify which numbers correspond to cases, deaths, etc.
    const stats: DiseaseStats = {
      disease: disease,
      globalCases: numbers.cases || 0,
      globalDeaths: numbers.deaths || 0,
      recentCases: numbers.recent || 0,
      affectedCountries: numbers.countries || 0,
      lastUpdated: new Date().toISOString(),
      sources: searchResults.results.slice(0, 3).map(r => r.url),
      summary: answer || searchResults.results[0]?.content.substring(0, 300) || 'No summary available'
    };

    return stats;
  }

  /**
   * Extract numbers from text with context
   */
  private extractNumbers(text: string): Record<string, number> {
    const result: Record<string, number> = {};

    // Patterns for different statistics
    const patterns = {
      cases: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|thousand|k)?\s*(?:total|confirmed|reported)?\s*cases/gi,
      deaths: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:million|m|thousand|k)?\s*deaths?/gi,
      recent: /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:new|recent|daily)\s*cases/gi,
      countries: /(\d+)\s*countries/gi
    };

    for (const [key, pattern] of Object.entries(patterns)) {
      const matches = text.matchAll(pattern);
      const numbers: number[] = [];
      
      for (const match of matches) {
        const numStr = match[1].replace(/,/g, '');
        let num = parseFloat(numStr);
        
        // Handle million/thousand multipliers
        if (match[0].toLowerCase().includes('million') || match[0].toLowerCase().includes('m ')) {
          num *= 1000000;
        } else if (match[0].toLowerCase().includes('thousand') || match[0].toLowerCase().includes('k ')) {
          num *= 1000;
        }
        
        numbers.push(num);
      }
      
      // Take the largest number found for each category
      if (numbers.length > 0) {
        result[key] = Math.max(...numbers);
      }
    }

    return result;
  }

  /**
   * Provide fallback statistics when API fails
   */
  private getFallbackStats(disease: string): DiseaseStats {
    const fallbackData: Record<string, Partial<DiseaseStats>> = {
      'covid-19': {
        globalCases: 487, // Current active cases in 2026 (pandemic has subsided)
        globalDeaths: 7, // Recent deaths
        recentCases: 15, // New cases per day globally
        affectedCountries: 15 // Countries with active cases
      },
      'tuberculosis': {
        globalCases: 10600000,
        globalDeaths: 1300000,
        recentCases: 30000,
        affectedCountries: 180
      },
      'malaria': {
        globalCases: 247000000,
        globalDeaths: 619000,
        recentCases: 680000,
        affectedCountries: 85
      },
      'dengue': {
        globalCases: 5200000,
        globalDeaths: 20000,
        recentCases: 15000,
        affectedCountries: 129
      },
      'influenza': {
        globalCases: 1000000000,
        globalDeaths: 650000,
        recentCases: 100000,
        affectedCountries: 195
      }
    };

    const data = fallbackData[disease.toLowerCase()] || {
      globalCases: 0,
      globalDeaths: 0,
      recentCases: 0,
      affectedCountries: 0
    };

    return {
      disease: disease,
      globalCases: data.globalCases || 0,
      globalDeaths: data.globalDeaths || 0,
      recentCases: data.recentCases || 0,
      affectedCountries: data.affectedCountries || 0,
      lastUpdated: new Date().toISOString(),
      sources: ['Fallback data - API unavailable'],
      summary: `Estimated statistics for ${disease}. Real-time data temporarily unavailable.`
    };
  }
}

// Export singleton instance
export const tavilyService = new TavilyService();
