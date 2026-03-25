'use client';

import { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';

interface MessageTranslatorProps {
  text: string;
  token?: string;
  onTranslate?: (translatedText: string, language: string) => void;
}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' }
];

export default function MessageTranslator({ text, token, onTranslate }: MessageTranslatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async (languageCode: string) => {
    setLoading(true);
    setSelectedLanguage(languageCode);

    try {
      const authToken = token || localStorage.getItem('token');
      
      if (!authToken) {
        alert('Please log in to use translation');
        setLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/technical/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          text,
          targetLang: languageCode,
          sourceLang: 'auto'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        if (response.status === 401) {
          alert('Session expired. Please log in again.');
        } else if (response.status === 500 && errorData.error?.includes('not configured')) {
          alert('Translation service not configured. Please set OPENAI_API_KEY in the API server.');
        } else {
          alert('Translation failed: ' + (errorData.error || 'Unknown error'));
        }
        
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTranslatedText(data.data.translatedText);
        setIsOpen(true);
        onTranslate?.(data.data.translatedText, languageCode);
      } else {
        alert('Translation failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Translation error:', error);
      alert('Failed to translate message. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      {/* Translate Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 hover:underline px-1 py-0.5 transition-colors bg-transparent"
        title="Translate message"
      >
        <Languages className="w-3 h-3" />
        <span>Translate</span>
      </button>

      {/* Language Selector Dropdown */}
      {isOpen && !translatedText && !loading && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-2 min-w-[200px]">
          <p className="text-xs font-medium text-gray-700 mb-2 px-2">Translate to:</p>
          <div className="max-h-60 overflow-y-auto">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded transition-colors"
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Translating...
          </div>
        </div>
      )}

      {/* Translation Result */}
      {translatedText && isOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 p-4 max-w-md min-w-[250px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">
              Translation ({languages.find(l => l.code === selectedLanguage)?.name}):
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setTranslatedText('');
              }}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-900 whitespace-pre-wrap">{translatedText}</p>
        </div>
      )}
    </div>
  );
}
