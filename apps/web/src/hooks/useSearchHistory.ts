import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';

const MAX_HISTORY_ITEMS = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  type?: 'all' | 'posts' | 'users' | 'communities';
}

export function useSearchHistory() {
  const { user } = useJWTAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // Generate user-specific key
  const getStorageKey = () => {
    if (!user?.id) return 'medthread_search_history_guest';
    return `medthread_search_history_${user.id}`;
  };

  // Load history from localStorage on mount or when user changes
  useEffect(() => {
    const storageKey = getStorageKey();
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse search history:', error);
        localStorage.removeItem(storageKey);
      }
    } else {
      setHistory([]);
    }
  }, [user?.id]);

  // Add a search to history
  const addToHistory = (query: string, type?: 'all' | 'posts' | 'users' | 'communities') => {
    if (!query.trim()) return;

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter((item) => item.query.toLowerCase() !== query.toLowerCase());
      
      // Add new item at the beginning
      const newHistory = [
        { query: query.trim(), timestamp: Date.now(), type },
        ...filtered
      ].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage with user-specific key
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(newHistory));
      
      return newHistory;
    });
  };

  // Remove a specific item from history
  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.query !== query);
      const storageKey = getStorageKey();
      localStorage.setItem(storageKey, JSON.stringify(filtered));
      return filtered;
    });
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    const storageKey = getStorageKey();
    localStorage.removeItem(storageKey);
  };

  // Get recent searches (last 5)
  const getRecentSearches = (limit = 5) => {
    return history.slice(0, limit);
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    getRecentSearches
  };
}
