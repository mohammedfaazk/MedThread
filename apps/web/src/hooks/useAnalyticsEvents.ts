import { useEffect, useRef, useState, useCallback } from 'react';

export interface AnalyticsEvent {
  type: 'user:registered' | 'user:active' | 'user:inactive' | 'post:created' | 'appointment:booked' | 'report:filed' | 'community:activity';
  data: any;
  timestamp: string;
}

interface UseAnalyticsEventsOptions {
  onEvent?: (event: AnalyticsEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  autoConnect?: boolean;
}

// Global flag to prevent multiple connections
let globalConnection: EventSource | null = null;
let globalConnectionCount = 0;

export function useAnalyticsEvents(options: UseAnalyticsEventsOptions = {}) {
  const {
    onEvent,
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<AnalyticsEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Prevent duplicate connections globally
    if (globalConnection || eventSourceRef.current || isConnectingRef.current || reconnectAttemptsRef.current >= maxReconnectAttempts) {
      console.log('Skipping connection - already connected or connecting');
      return;
    }

    isConnectingRef.current = true;
    globalConnectionCount++;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.warn('No auth token found, cannot connect to analytics events');
        isConnectingRef.current = false;
        globalConnectionCount--;
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const url = `${apiUrl}/api/analytics-sse/events?token=${encodeURIComponent(token)}`;

      console.log(`Creating SSE connection (count: ${globalConnectionCount})`);

      // Create EventSource with auth token in URL (EventSource doesn't support headers)
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;
      globalConnection = eventSource;

      eventSource.onopen = () => {
        console.log('✅ Analytics events stream connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        isConnectingRef.current = false;
        onConnect?.();
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Skip heartbeat and connection messages
          if (data.type === 'connected' || event.data === ': heartbeat') {
            return;
          }

          const analyticsEvent: AnalyticsEvent = data;
          setLastEvent(analyticsEvent);
          onEvent?.(analyticsEvent);
        } catch (error) {
          console.error('Failed to parse analytics event:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('Analytics events stream error:', error);
        setIsConnected(false);
        isConnectingRef.current = false;
        
        // Close the connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        if (globalConnection) {
          globalConnection = null;
          globalConnectionCount = Math.max(0, globalConnectionCount - 1);
        }
        
        onDisconnect?.();

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.min(3000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
          onError?.(new Error('Max reconnection attempts reached'));
        }
      };
    } catch (error) {
      console.error('Failed to connect to analytics events:', error);
      isConnectingRef.current = false;
      globalConnectionCount = Math.max(0, globalConnectionCount - 1);
      onError?.(error as Error);
    }
  }, [onEvent, onConnect, onDisconnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      console.log('Closing SSE connection');
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnect?.();
    }

    if (globalConnection) {
      globalConnection = null;
      globalConnectionCount = Math.max(0, globalConnectionCount - 1);
    }

    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;
  }, [onDisconnect]);

  useEffect(() => {
    if (autoConnect) {
      // Small delay to prevent duplicate connections in React strict mode
      const timer = setTimeout(() => {
        connect();
      }, 100);

      return () => {
        clearTimeout(timer);
        disconnect();
      };
    }

    return () => {
      disconnect();
    };
  }, []); // Empty deps to only run once

  return {
    isConnected,
    lastEvent,
    connect,
    disconnect
  };
}
