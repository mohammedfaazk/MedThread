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
  query: string;
  response_time: number;
}

export class TavilySearchService {
  /**
   * Search for disease information using Tavily API
   */
  static async searchDiseaseInfo(query: string): Promise<TavilyResponse> {
    if (!TAVILY_API_KEY) {
      throw new Error('TAVILY_API_KEY is not configured');
    }

    try {
      const response = await axios.post(
        TAVILY_API_URL,
        {
          api_key: TAVILY_API_KEY,
          query: query,
          search_depth: 'advanced',
          include_domains: [
            'who.int',
            'cdc.gov',
            'nih.gov',
            'healthmap.org',
            'ecdc.europa.eu',
            'mohfw.gov.in'
          ],
          max_results: 5
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Tavily search error:', error.response?.data || error.message);
      throw new Error(`Failed to search disease information: ${error.message}`);
    }
  }

  /**
   * Extract case numbers and statistics from search results
   */
  static extractStatistics(results: TavilySearchResult[]): {
    cases?: number;
    deaths?: number;
    trend?: string;
    summary: string;
    sources: string[];
  } {
    const sources = results.map(r => r.url);
    const allContent = results.map(r => r.content).join(' ');

    // Extract numbers with better patterns
    // Look for patterns like "6,563 cases" or "6563 cases" or "6.5K cases"
    const casePatterns = [
      /(\d{1,3}(?:,\d{3})+)\s*(?:cases|infections|patients|reported)/gi,
      /(\d+)\s*(?:cases|infections|patients|reported)/gi,
      /(\d+\.?\d*)\s*(?:thousand|K)\s*(?:cases|infections)/gi,
      /(?:cases|infections):\s*(\d{1,3}(?:,\d{3})+)/gi,
      /(?:cases|infections):\s*(\d+)/gi
    ];

    const deathPatterns = [
      /(\d{1,3}(?:,\d{3})+)\s*(?:deaths|fatalities)/gi,
      /(\d+)\s*(?:deaths|fatalities)/gi,
      /(?:deaths|fatalities):\s*(\d{1,3}(?:,\d{3})+)/gi,
      /(?:deaths|fatalities):\s*(\d+)/gi
    ];

    let cases: number | undefined;
    let deaths: number | undefined;

    // Try each pattern for cases
    for (const pattern of casePatterns) {
      const matches = allContent.match(pattern);
      if (matches && matches.length > 0) {
        // Get the first match and extract the number
        const numStr = matches[0].match(/(\d{1,3}(?:,\d{3})+|\d+\.?\d*)/)?.[0];
        if (numStr) {
          // Handle K/thousand notation
          if (matches[0].toLowerCase().includes('thousand') || matches[0].toLowerCase().includes('k')) {
            cases = Math.round(parseFloat(numStr.replace(/,/g, '')) * 1000);
          } else {
            cases = parseInt(numStr.replace(/,/g, ''));
          }
          if (cases > 0) break;
        }
      }
    }

    // Try each pattern for deaths
    for (const pattern of deathPatterns) {
      const matches = allContent.match(pattern);
      if (matches && matches.length > 0) {
        const numStr = matches[0].match(/(\d{1,3}(?:,\d{3})+|\d+)/)?.[0];
        if (numStr) {
          deaths = parseInt(numStr.replace(/,/g, ''));
          if (deaths > 0) break;
        }
      }
    }

    // Extract trend keywords
    const trendKeywords = ['increasing', 'rising', 'declining', 'stable', 'outbreak', 'epidemic', 'surge', 'spike'];
    const trend = trendKeywords.find(keyword => 
      allContent.toLowerCase().includes(keyword)
    ) || 'stable';

    // Create summary from first result
    const summary = results[0]?.content.substring(0, 400) + '...' || 'No data available';

    console.log(`📊 Extracted: ${cases || 0} cases, ${deaths || 0} deaths, trend: ${trend}`);

    return {
      cases,
      deaths,
      trend,
      summary,
      sources
    };
  }
}
