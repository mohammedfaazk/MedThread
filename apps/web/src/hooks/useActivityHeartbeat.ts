'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that sends periodic heartbeat pings to keep user activity fresh
 * This ensures the user shows as "active" in admin analytics
 */
export function useActivityHeartbeat() {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          // Clear interval if user logs out
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        const response = await fetch(`${baseUrl}/api/ping/ping`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          console.log('💓 Activity heartbeat sent');
        } else if (response.status === 401) {
          // Token expired or invalid - stop heartbeat
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.debug('Heartbeat failed:', error);
      }
    };

    // Send initial heartbeat
    sendHeartbeat();

    // Send heartbeat every 3 minutes (180000ms)
    intervalRef.current = setInterval(sendHeartbeat, 180000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
