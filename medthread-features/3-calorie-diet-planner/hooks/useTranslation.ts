import { useApp } from '@/app/context/AppContext';
import { languageService } from '@/services/languageService';
import type { LanguageCode } from '@/services/languageService';
import { useEffect, useState } from 'react';

/**
 * Custom hook for translations that properly integrates with React's reactivity
 * This ensures components re-render when language changes
 */
export const useTranslation = () => {
  const { selectedLanguageCode } = useApp();
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    // Force re-render when language changes
    setForceUpdate(prev => prev + 1);
  }, [selectedLanguageCode]);

  const t = (key: string): string => {
    const translation = languageService.translate(key, selectedLanguageCode as LanguageCode);
    return translation;
  };

  return { t, lang: selectedLanguageCode };
};
