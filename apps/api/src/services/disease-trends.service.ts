import { prisma } from '@medthread/database';
import { TavilySearchService } from './tavily-search.service';

const CACHE_DURATION_DAYS = 7;

export class DiseaseTrendsService {
  /**
   * Get disease trends with caching
   */
  static async getDiseaseTrends(disease: string, location: string, year: number) {
    // Check cache first
    const cached = await this.getCachedData(disease, location, year);
    if (cached) {
      console.log(`✅ Cache HIT for ${disease} in ${location} (${year})`);
      return {
        ...cached.data,
        cached: true,
        lastUpdated: cached.lastUpdated
      };
    }

    console.log(`🔍 Cache MISS - Searching for ${disease} in ${location} (${year})`);

    // Build more specific search query with recent timeframe
    const currentDate = new Date();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonth = monthNames[currentDate.getMonth()];
    
    const searchQuery = `${disease} outbreak ${location} ${year} ${currentMonth} latest cases statistics recent data`;

    try {
      // Search using Tavily
      const searchResults = await TavilySearchService.searchDiseaseInfo(searchQuery);
      
      // Extract statistics
      const stats = TavilySearchService.extractStatistics(searchResults.results);

      // Prepare data to cache
      const data = {
        disease,
        location,
        year,
        cases: stats.cases,
        deaths: stats.deaths,
        trend: stats.trend,
        summary: stats.summary,
        sources: stats.sources,
        searchQuery,
        dataAvailable: searchResults.results.length > 0
      };

      // Cache the result
      await this.cacheData(disease, location, year, searchQuery, data, stats.sources);

      return {
        ...data,
        cached: false,
        lastUpdated: new Date()
      };
    } catch (error: any) {
      console.error('Error fetching disease trends:', error);
      
      // Return fallback data
      return {
        disease,
        location,
        year,
        dataAvailable: false,
        error: 'Unable to fetch current data',
        message: 'Data from WHO API - Implementation in progress',
        cached: false
      };
    }
  }

  /**
   * Get cached data if available and not expired
   */
  private static async getCachedData(disease: string, location: string, year: number) {
    try {
      const cached = await prisma.diseaseTrendsCache.findFirst({
        where: {
          disease: disease.toLowerCase(),
          location: location.toLowerCase(),
          year,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          lastUpdated: 'desc'
        }
      });

      return cached;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Cache disease trends data
   */
  private static async cacheData(
    disease: string,
    location: string,
    year: number,
    searchQuery: string,
    data: any,
    sources: string[]
  ) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + CACHE_DURATION_DAYS);

      await prisma.diseaseTrendsCache.create({
        data: {
          disease: disease.toLowerCase(),
          location: location.toLowerCase(),
          year,
          searchQuery,
          data: data as any,
          sources: sources as any,
          expiresAt,
          lastUpdated: new Date()
        }
      });

      console.log(`💾 Cached data for ${disease} in ${location} (${year})`);
    } catch (error) {
      console.error('Error caching data:', error);
      // Don't throw - caching failure shouldn't break the request
    }
  }

  /**
   * Clear expired cache entries
   */
  static async clearExpiredCache() {
    try {
      const result = await prisma.diseaseTrendsCache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      console.log(`🗑️ Cleared ${result.count} expired cache entries`);
      return result.count;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return 0;
    }
  }
}
