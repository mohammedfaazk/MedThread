'use client';

import { useState, useEffect } from 'react';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useTranslation() {
  const { settings } = useAccessibility();
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (text: string, targetLang?: string): Promise<string> => {
    const lang = targetLang || settings.language;
    
    // Don't translate if already in target language or target is English
    if (lang === 'en') return text;

    try {
      setIsTranslating(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/v1/technical/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          text,
          targetLang: lang,
          sourceLang: 'auto'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.translatedText;
      }
      
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  const translateBatch = async (texts: string[], targetLang?: string): Promise<string[]> => {
    const lang = targetLang || settings.language;
    
    if (lang === 'en') return texts;

    try {
      setIsTranslating(true);
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/v1/technical/translate/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          texts,
          targetLang: lang,
          sourceLang: 'auto'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.translations;
      }
      
      return texts;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsTranslating(false);
    }
  };

  const detectLanguage = async (text: string): Promise<string> => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/v1/technical/translate/detect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.language;
      }
      
      return 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  };

  const translateMedicalTerm = async (term: string, targetLang?: string) => {
    const lang = targetLang || settings.language;
    
    if (lang === 'en') return { translation: term, definition: '', pronunciation: '' };

    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${API_URL}/api/v1/technical/translate/medical-term`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ term, targetLang: lang })
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return { translation: term, definition: '', pronunciation: '' };
    } catch (error) {
      console.error('Medical term translation error:', error);
      return { translation: term, definition: '', pronunciation: '' };
    }
  };

  return {
    translate,
    translateBatch,
    detectLanguage,
    translateMedicalTerm,
    isTranslating,
    currentLanguage: settings.language
  };
}
