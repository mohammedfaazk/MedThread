import { prisma } from '@medthread/database';
import axios from 'axios';

// Free MyMemory Translation API - NO API KEY REQUIRED!
const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  bn: 'Bengali (বাংলা)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  ta: 'Tamil (தமிழ்)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  ur: 'Urdu (اردو)',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  pt: 'Portuguese',
  ar: 'Arabic',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ru: 'Russian',
  it: 'Italian'
};

interface TranslationCache {
  sourceText: string;
  sourceLang: string;
  targetLang: string;
  translatedText: string;
}

export class TranslationService {
  private cache: Map<string, string> = new Map();

  /**
   * Translate text using MyMemory API (100% Free, No API Key!)
   */
  async translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
    try {
      // Check cache first
      const cacheKey = `${sourceLang}:${targetLang}:${text}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Check database cache
      const dbCache = await this.getFromDatabaseCache(text, sourceLang, targetLang);
      if (dbCache) {
        this.cache.set(cacheKey, dbCache);
        return dbCache;
      }

      // Auto-detect source language (default to English)
      if (sourceLang === 'auto') {
        sourceLang = 'en';
      }

      // Don't translate if source and target are the same
      if (sourceLang === targetLang) {
        return text;
      }

      // Translate using MyMemory API (Free, no API key needed!)
      const response = await axios.get(MYMEMORY_API_URL, {
        params: {
          q: text,
          langpair: `${sourceLang}|${targetLang}`
        },
        timeout: 10000
      });

      const translatedText = response.data?.responseData?.translatedText || text;

      // Cache the translation
      this.cache.set(cacheKey, translatedText);
      await this.saveToDatabaseCache(text, sourceLang, targetLang, translatedText);

      return translatedText;
    } catch (error: any) {
      console.error('[Translation] Error translating text:', error.message);
      return text; // Return original text on error
    }
  }

  /**
   * Translate multiple texts in batch
   */
  async translateBatch(texts: string[], targetLang: string, sourceLang: string = 'auto'): Promise<string[]> {
    try {
      const translations = await Promise.all(
        texts.map(text => this.translateText(text, targetLang, sourceLang))
      );
      return translations;
    } catch (error) {
      console.error('[Translation] Error in batch translation:', error);
      return texts;
    }
  }

  /**
   * Detect language (simplified - defaults to English)
   */
  async detectLanguage(text: string): Promise<string> {
    // Simple heuristic detection based on character sets
    const hasHindi = /[\u0900-\u097F]/.test(text);
    const hasChinese = /[\u4E00-\u9FFF]/.test(text);
    const hasArabic = /[\u0600-\u06FF]/.test(text);
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
    const hasKorean = /[\uAC00-\uD7AF]/.test(text);
    
    if (hasHindi) return 'hi';
    if (hasChinese) return 'zh';
    if (hasArabic) return 'ar';
    if (hasJapanese) return 'ja';
    if (hasKorean) return 'ko';
    
    return 'en'; // Default to English
  }

  /**
   * Get user's preferred language
   */
  async getUserLanguage(userId: string): Promise<string> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferredLanguage: true }
      });

      return user?.preferredLanguage || 'en';
    } catch (error) {
      console.error('[Translation] Error getting user language:', error);
      return 'en';
    }
  }

  /**
   * Set user's preferred language
   */
  async setUserLanguage(userId: string, language: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { preferredLanguage: language }
      });
    } catch (error) {
      console.error('[Translation] Error setting user language:', error);
      throw error;
    }
  }

  /**
   * Translate medical terms (simplified for free API)
   */
  async translateMedicalTerm(term: string, targetLang: string): Promise<{
    translation: string;
    definition: string;
    pronunciation?: string;
  }> {
    try {
      const translation = await this.translateText(term, targetLang, 'en');
      
      return {
        translation,
        definition: `Medical term translated from English to ${SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES] || targetLang}`
      };
    } catch (error) {
      console.error('[Translation] Error translating medical term:', error);
      return {
        translation: term,
        definition: 'Translation unavailable'
      };
    }
  }

  /**
   * Get from database cache
   */
  private async getFromDatabaseCache(text: string, sourceLang: string, targetLang: string): Promise<string | null> {
    try {
      const cached = await prisma.translationCache.findFirst({
        where: {
          sourceText: text,
          sourceLang,
          targetLang
        }
      });

      return cached?.translatedText || null;
    } catch (error) {
      console.error('[Translation] Error getting from cache:', error);
      return null;
    }
  }

  /**
   * Save to database cache
   */
  private async saveToDatabaseCache(sourceText: string, sourceLang: string, targetLang: string, translatedText: string): Promise<void> {
    try {
      await prisma.translationCache.create({
        data: {
          sourceText,
          sourceLang,
          targetLang,
          translatedText
        }
      });
    } catch (error) {
      // Ignore duplicate errors
      if (!error.message?.includes('Unique constraint')) {
        console.error('[Translation] Error saving to cache:', error);
      }
    }
  }

  /**
   * Get translation statistics
   */
  async getTranslationStats(): Promise<{
    totalTranslations: number;
    byLanguage: Record<string, number>;
  }> {
    try {
      const [total, byLanguage] = await Promise.all([
        prisma.translationCache.count(),
        prisma.translationCache.groupBy({
          by: ['targetLang'],
          _count: true
        })
      ]);

      const stats: Record<string, number> = {};
      byLanguage.forEach(item => {
        stats[item.targetLang] = item._count;
      });

      return {
        totalTranslations: total,
        byLanguage: stats
      };
    } catch (error) {
      console.error('[Translation] Error getting stats:', error);
      return {
        totalTranslations: 0,
        byLanguage: {}
      };
    }
  }
}

export const translationService = new TranslationService();
