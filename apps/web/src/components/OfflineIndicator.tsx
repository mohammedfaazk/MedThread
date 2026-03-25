'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi, Download } from 'lucide-react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${
        isOnline ? 'bg-green-600' : 'bg-orange-600'
      } text-white py-3 px-4 shadow-lg transition-all`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isOnline ? (
            <>
              <Wifi className="w-5 h-5" />
              <span className="font-medium">Back online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 animate-pulse" />
              <div>
                <p className="font-medium">You're offline</p>
                <p className="text-sm opacity-90">
                  You can still view cached messages
                </p>
              </div>
            </>
          )}
        </div>

        {!isOnline && (
          <div className="flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />
            <span>Cached content available</span>
          </div>
        )}
      </div>
    </div>
  );
}
