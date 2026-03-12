'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';

interface AnalyticsData {
  health: {
    trending: any[];
    alerts: any[];
  };
  doctor: {
    leaderboard: any[];
  };
  platform: {
    peakUsage: any;
    bottlenecks: any;
  };
}

interface AnalyticsSocketContextType {
  analyticsData: AnalyticsData;
  subscribe: (type: 'health' | 'doctor' | 'platform') => void;
  unsubscribe: (type: 'health' | 'doctor' | 'platform') => void;
  isConnected: boolean;
}

const AnalyticsSocketContext = createContext<AnalyticsSocketContextType | undefined>(undefined);

export const AnalyticsSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [isConnected, setIsConnected] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    health: { trending: [], alerts: [] },
    doctor: { leaderboard: [] },
    platform: { peakUsage: null, bottlenecks: null }
  });

  useEffect(() => {
    if (!socket) return;

    setIsConnected(socket.connected);

    // Connection events
    socket.on('connect', () => {
      console.log('[Analytics] Socket connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Analytics] Socket disconnected');
      setIsConnected(false);
    });

    // Health analytics events
    socket.on('analytics:health:initial', (data) => {
      console.log('[Analytics] Received initial health data', data);
      setAnalyticsData(prev => ({
        ...prev,
        health: data
      }));
    });

    socket.on('analytics:health:symptom-report', (report) => {
      console.log('[Analytics] New symptom report', report);
      // Trigger a refresh or update UI
    });

    socket.on('analytics:health:trends-update', (trends) => {
      console.log('[Analytics] Health trends updated', trends);
      setAnalyticsData(prev => ({
        ...prev,
        health: { ...prev.health, trending: trends }
      }));
    });

    socket.on('analytics:health:alert', (alert) => {
      console.log('[Analytics] New health alert', alert);
      setAnalyticsData(prev => ({
        ...prev,
        health: {
          ...prev.health,
          alerts: [alert, ...prev.health.alerts]
        }
      }));
    });

    // Doctor analytics events
    socket.on('analytics:doctor:initial', (data) => {
      console.log('[Analytics] Received initial doctor data', data);
      setAnalyticsData(prev => ({
        ...prev,
        doctor: data
      }));
    });

    socket.on('analytics:doctor:performance-update', (performance) => {
      console.log('[Analytics] Doctor performance updated', performance);
      setAnalyticsData(prev => ({
        ...prev,
        doctor: {
          ...prev.doctor,
          leaderboard: prev.doctor.leaderboard.map(d =>
            d.doctorId === performance.doctorId ? { ...d, ...performance } : d
          )
        }
      }));
    });

    socket.on('analytics:doctor:rating', (rating) => {
      console.log('[Analytics] New doctor rating', rating);
      // Trigger leaderboard refresh
    });

    // Platform analytics events
    socket.on('analytics:platform:initial', (data) => {
      console.log('[Analytics] Received initial platform data', data);
      setAnalyticsData(prev => ({
        ...prev,
        platform: data
      }));
    });

    socket.on('analytics:platform:metrics-update', (metrics) => {
      console.log('[Analytics] Platform metrics updated', metrics);
      setAnalyticsData(prev => ({
        ...prev,
        platform: { ...prev.platform, ...metrics }
      }));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('analytics:health:initial');
      socket.off('analytics:health:symptom-report');
      socket.off('analytics:health:trends-update');
      socket.off('analytics:health:alert');
      socket.off('analytics:doctor:initial');
      socket.off('analytics:doctor:performance-update');
      socket.off('analytics:doctor:rating');
      socket.off('analytics:platform:initial');
      socket.off('analytics:platform:metrics-update');
    };
  }, [socket]);

  const subscribe = (type: 'health' | 'doctor' | 'platform') => {
    if (socket) {
      console.log(`[Analytics] Subscribing to ${type}`);
      socket.emit('analytics:subscribe', { type });
    }
  };

  const unsubscribe = (type: 'health' | 'doctor' | 'platform') => {
    if (socket) {
      console.log(`[Analytics] Unsubscribing from ${type}`);
      socket.emit('analytics:unsubscribe', { type });
    }
  };

  return (
    <AnalyticsSocketContext.Provider value={{ analyticsData, subscribe, unsubscribe, isConnected }}>
      {children}
    </AnalyticsSocketContext.Provider>
  );
};

export const useAnalyticsSocket = () => {
  const context = useContext(AnalyticsSocketContext);
  if (!context) {
    throw new Error('useAnalyticsSocket must be used within AnalyticsSocketProvider');
  }
  return context;
};
