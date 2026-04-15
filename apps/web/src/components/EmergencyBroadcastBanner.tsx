'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Info, AlertCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface EmergencyBroadcast {
  id: string;
  title: string;
  message: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  type: 'HEALTH_ALERT' | 'SYSTEM' | 'EMERGENCY';
  createdAt: string;
  expiresAt?: string;
}

export function EmergencyBroadcastBanner() {
  const [broadcasts, setBroadcasts] = useState<EmergencyBroadcast[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchActiveBroadcasts();
    
    // Poll for new broadcasts every 30 seconds
    const interval = setInterval(fetchActiveBroadcasts, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchActiveBroadcasts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/emergency-broadcast/active`);
      const result = await response.json();
      
      if (result.success) {
        setBroadcasts(result.data);
      }
    } catch (error: any) {
      // Don't render error in UI, just log it
      console.error('Error fetching broadcasts:', error?.message || error);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
    localStorage.setItem(`broadcast-dismissed-${id}`, 'true');
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-600',
          text: 'text-white',
          icon: AlertTriangle,
          border: 'border-red-700'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          icon: AlertCircle,
          border: 'border-orange-600'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: Info,
          border: 'border-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: Info,
          border: 'border-gray-600'
        };
    }
  };

  const activeBroadcasts = broadcasts.filter(b => !dismissed.has(b.id));

  if (activeBroadcasts.length === 0) return null;

  // Show only the highest priority alert
  const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
  const topAlert = activeBroadcasts.sort((a, b) => 
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )[0];

  if (!topAlert) return null;

  const styles = getPriorityStyles(topAlert.priority);
  const Icon = styles.icon;
  const hasMoreAlerts = activeBroadcasts.length > 1;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div
        className={`${styles.bg} ${styles.text} border-b-2 ${styles.border} shadow-lg`}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Icon className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="font-bold text-sm">{topAlert.title}</p>
                <p className="text-sm opacity-90">{topAlert.message}</p>
                {hasMoreAlerts && (
                  <a 
                    href="/alerts-history" 
                    className="text-xs underline opacity-80 hover:opacity-100 mt-1 inline-block"
                  >
                    +{activeBroadcasts.length - 1} more alert{activeBroadcasts.length - 1 > 1 ? 's' : ''} - View all
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDismiss(topAlert.id)}
              className="p-1 hover:bg-white/20 rounded-lg transition flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
