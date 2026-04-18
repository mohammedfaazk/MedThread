'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const MIN_LOADING_TIME = 800; // Minimum time to show loader (in milliseconds)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingStartTime = useRef<number | null>(null);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  const startLoading = useCallback(() => {
    // Clear any pending stop timeout
    if (loadingTimeout.current) {
      clearTimeout(loadingTimeout.current);
      loadingTimeout.current = null;
    }
    
    loadingStartTime.current = Date.now();
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    if (!loadingStartTime.current) {
      setIsLoading(false);
      return;
    }

    const elapsedTime = Date.now() - loadingStartTime.current;
    const remainingTime = MIN_LOADING_TIME - elapsedTime;

    if (remainingTime > 0) {
      // Wait for the remaining time before hiding loader
      loadingTimeout.current = setTimeout(() => {
        setIsLoading(false);
        loadingStartTime.current = null;
        loadingTimeout.current = null;
      }, remainingTime);
    } else {
      // Minimum time has passed, hide immediately
      setIsLoading(false);
      loadingStartTime.current = null;
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}
