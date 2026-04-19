/**
 * 🧠 SENTIMENT ANALYSIS SERVICE
 * 
 * Analyzes patient review text to extract sentiment scores
 * Used to enhance doctor scoring beyond just star ratings
 */

import Groq from 'groq-sdk';

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

interface SentimentResult {
  score: number; // -1 (very negative) to 1 (very positive)
  confidence: number; // 0 to 1
  category: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'VERY_NEGATIVE';
  keywords: {
    positive: string[];
    negative: string[];
  };
}

export class SentimentAnalysisService {

  /**
   * Analyze sentiment of patient review text
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      return this.getDefaultSentiment();
    }

    // Try AI-based analysis first (more accurate)
    if (groq) {
      try {
        const aiResult = await this.aiSentimentAnalysis(text);
        return aiResult;
      } catch (error) {
        console.error('[SentimentAnalysis] AI analysis failed, falling back to rule-based:', error);
      }
    }

    // Fallback to rule-based analysis
    return this.ruleBasedSentimentAnalysis(text);
  }

  /**
   * AI-based sentiment analysis using Groq
   */
  private async aiSentimentAnalysis(text: string): Promise<SentimentResult> {
    const response = await groq!.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a medical review sentiment analyzer. Analyze the patient's review of their doctor and respond with JSON:
{
  "score": <number from -1 to 1>,
  "confidence": <number from 0 to 1>,
  "category": "VERY_POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY_NEGATIVE",
  "keywords": {
    "positive": [<array of positive keywords found>],
    "negative": [<array of negative keywords found>]
  }
}

Consider:
- Medical expertise and competence
- Bedside manner and empathy
- Communication clarity
- Treatment effectiveness
- Wait times and accessibility
- Overall patient satisfaction`
        },
        {
          role: 'user',
          content: text
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // Validate and normalize
    return {
      score: Math.max(-1, Math.min(1, result.score || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5)),
      category: result.category || 'NEUTRAL',
      keywords: {
        positive: result.keywords?.positive || [],
        negative: result.keywords?.negative || []
      }
    };
  }

  /**
   * Rule-based sentiment analysis (fallback)
   */
  private ruleBasedSentimentAnalysis(text: string): Promise<SentimentResult> {
    const lowerText = text.toLowerCase();

    // Medical-specific positive keywords
    const positiveKeywords = [
      'excellent', 'great', 'amazing', 'wonderful', 'fantastic', 'outstanding',
      'professional', 'knowledgeable', 'expert', 'skilled', 'experienced',
      'caring', 'compassionate', 'empathetic', 'kind', 'patient', 'understanding',
      'helpful', 'thorough', 'detailed', 'clear', 'explained well',
      'cured', 'healed', 'better', 'improved', 'recovered', 'relief',
      'recommend', 'trust', 'confident', 'comfortable', 'satisfied',
      'attentive', 'listened', 'responsive', 'prompt', 'quick'
    ];

    // Medical-specific negative keywords
    const negativeKeywords = [
      'terrible', 'awful', 'horrible', 'worst', 'bad', 'poor',
      'rude', 'dismissive', 'arrogant', 'unprofessional', 'careless',
      'rushed', 'hurried', 'didn\'t listen', 'ignored', 'dismissed',
      'misdiagnosed', 'wrong', 'mistake', 'error', 'incompetent',
      'waste', 'useless', 'ineffective', 'didn\'t help', 'no improvement',
      'long wait', 'delayed', 'late', 'unavailable', 'unresponsive',
      'expensive', 'overcharged', 'unnecessary', 'pushy'
    ];

    // Count keyword matches
    const foundPositive: string[] = [];
    const foundNegative: string[] = [];

    positiveKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundPositive.push(keyword);
      }
    });

    negativeKeywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        foundNegative.push(keyword);
      }
    });

    // Calculate sentiment score
    const positiveCount = foundPositive.length;
    const negativeCount = foundNegative.length;
    const totalCount = positiveCount + negativeCount;

    let score = 0;
    let confidence = 0.5;
    let category: SentimentResult['category'] = 'NEUTRAL';

    if (totalCount > 0) {
      // Score from -1 to 1
      score = (positiveCount - negativeCount) / Math.max(totalCount, 5);
      score = Math.max(-1, Math.min(1, score));

      // Confidence based on keyword density
      const wordCount = text.split(/\s+/).length;
      confidence = Math.min(0.9, (totalCount / wordCount) * 10);

      // Categorize
      if (score > 0.5) category = 'VERY_POSITIVE';
      else if (score > 0.1) category = 'POSITIVE';
      else if (score > -0.1) category = 'NEUTRAL';
      else if (score > -0.5) category = 'NEGATIVE';
      else category = 'VERY_NEGATIVE';
    }

    return Promise.resolve({
      score,
      confidence,
      category,
      keywords: {
        positive: foundPositive,
        negative: foundNegative
      }
    });
  }

  /**
   * Batch analyze multiple reviews
   */
  async analyzeBatch(reviews: string[]): Promise<SentimentResult[]> {
    const results = await Promise.all(
      reviews.map(review => this.analyzeSentiment(review))
    );
    return results;
  }

  /**
   * Calculate aggregate sentiment from multiple reviews
   */
  calculateAggregateSentiment(sentiments: SentimentResult[]): {
    averageScore: number;
    averageConfidence: number;
    distribution: Record<string, number>;
    overallCategory: SentimentResult['category'];
  } {
    if (sentiments.length === 0) {
      return {
        averageScore: 0,
        averageConfidence: 0,
        distribution: {},
        overallCategory: 'NEUTRAL'
      };
    }

    const totalScore = sentiments.reduce((sum, s) => sum + s.score, 0);
    const totalConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0);
    const averageScore = totalScore / sentiments.length;
    const averageConfidence = totalConfidence / sentiments.length;

    // Calculate distribution
    const distribution: Record<string, number> = {
      VERY_POSITIVE: 0,
      POSITIVE: 0,
      NEUTRAL: 0,
      NEGATIVE: 0,
      VERY_NEGATIVE: 0
    };

    sentiments.forEach(s => {
      distribution[s.category] = (distribution[s.category] || 0) + 1;
    });

    // Determine overall category
    let overallCategory: SentimentResult['category'] = 'NEUTRAL';
    if (averageScore > 0.5) overallCategory = 'VERY_POSITIVE';
    else if (averageScore > 0.1) overallCategory = 'POSITIVE';
    else if (averageScore > -0.1) overallCategory = 'NEUTRAL';
    else if (averageScore > -0.5) overallCategory = 'NEGATIVE';
    else overallCategory = 'VERY_NEGATIVE';

    return {
      averageScore,
      averageConfidence,
      distribution,
      overallCategory
    };
  }

  /**
   * Get default sentiment for empty/null reviews
   */
  private getDefaultSentiment(): SentimentResult {
    return {
      score: 0,
      confidence: 0,
      category: 'NEUTRAL',
      keywords: {
        positive: [],
        negative: []
      }
    };
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();
