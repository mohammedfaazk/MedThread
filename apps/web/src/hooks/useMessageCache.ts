'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export function useMessageCache(conversationId: string) {
  const [cachedMessages, setCachedMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('auth_token');

      // Try to get cached messages first
      const response = await fetch(
        `${API_URL}/api/v1/technical/cache/messages/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const result = await response.json();
      if (result.success) {
        setCachedMessages(result.data);
      }
    } catch (error) {
      console.error('Error loading cached messages:', error);
      
      // Try to load from localStorage as fallback
      const localCache = localStorage.getItem(`messages_${conversationId}`);
      if (localCache) {
        setCachedMessages(JSON.parse(localCache));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cacheMessages = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await fetch(
        `${API_URL}/api/v1/technical/cache/messages/${conversationId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  };

  const prefetchForOffline = async (conversationIds: string[]) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/v1/technical/cache/prefetch`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ conversationIds })
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error prefetching:', error);
      return null;
    }
  };

  return {
    cachedMessages,
    isLoading,
    isOnline,
    cacheMessages,
    prefetchForOffline,
    refreshCache: loadMessages
  };
}
