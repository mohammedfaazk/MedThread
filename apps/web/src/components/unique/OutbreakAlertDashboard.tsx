'use client';

/**
 * 🚨 OUTBREAK ALERT DASHBOARD
 * 
 * This is a UNIQUE feature that no other healthcare platform has.
 * Shows real-time disease outbreak alerts for user's location.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, MapPin, X, Info } from 'lucide-react';

interface OutbreakAlert {
  id: string;
  disease: string;
  location: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  affectedCount: number;
  growthRate: number;
  alertMessage: string;
  actionItems: string[];
  createdAt: string;
}

export default function OutbreakAlertDashboard() {
  const [alerts, setAlerts] = useState<OutbreakAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOutbreakAlerts();
  }, []);

  const fetchOutbreakAlerts = async () => {
    try {
      const response = await fetch('/api/v1/unique/outbreak-alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAlerts(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching outbreak alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/v1/unique/outbreak-alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setDismissedAlerts(prev => new Set(prev).add(alertId));
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'HIGH':
        return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'MEDIUM':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'LOW':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const size = severity === 'CRITICAL' ? 28 : 24;
    return <AlertTriangle size={size} className="flex-shrink-0" />;
  };

  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="bg-green-100 p-3 rounded-full">
            <Info size={32} className="text-green-600" />
          </div>
        </div>
        <h3 className="text-lg font-semibold text-green-900 mb-2">
          No Active Outbreak Alerts
        </h3>
        <p className="text-green-700">
          Your area is currently safe. We'll notify you if any health alerts are detected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">
          🚨 Health Alerts in Your Area
        </h2>
        <span className="text-sm text-gray-600">
          {visibleAlerts.length} active alert{visibleAlerts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {visibleAlerts.map((alert) => (
        <div
          key={alert.id}
          className={`border-l-4 rounded-lg p-6 shadow-md transition-all hover:shadow-lg ${getSeverityColor(alert.severity)}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              {getSeverityIcon(alert.severity)}
              <div>
                <h3 className="text-xl font-bold mb-1">
                  {alert.disease} Outbreak
                </h3>
                <div className="flex items-center space-x-2 text-sm opacity-80">
                  <MapPin size={16} />
                  <span>{alert.location}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="p-1 hover:bg-black/10 rounded-full transition-colors"
              title="Dismiss alert"
            >
              <X size={20} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/50 rounded-lg p-3">
              <div className="text-sm opacity-70 mb-1">Affected Cases</div>
              <div className="text-2xl font-bold">{alert.affectedCount}</div>
            </div>
            <div className="bg-white/50 rounded-lg p-3">
              <div className="text-sm opacity-70 mb-1">Growth Rate</div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  {alert.growthRate > 0 ? '+' : ''}{alert.growthRate.toFixed(0)}%
                </span>
                {alert.growthRate > 0 ? (
                  <TrendingUp size={20} className="text-red-600" />
                ) : (
                  <TrendingDown size={20} className="text-green-600" />
                )}
              </div>
            </div>
          </div>

          {/* Alert Message */}
          <div className="bg-white/70 rounded-lg p-4 mb-4">
            <p className="font-medium">{alert.alertMessage}</p>
          </div>

          {/* Action Items */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center">
              <Info size={16} className="mr-2" />
              What You Should Do:
            </h4>
            <ul className="space-y-2">
              {alert.actionItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Severity Badge */}
          <div className="mt-4 pt-4 border-t border-current/20">
            <span className="inline-block px-3 py-1 bg-white/50 rounded-full text-sm font-semibold">
              {alert.severity} PRIORITY
            </span>
          </div>
        </div>
      ))}

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
        <p className="flex items-start">
          <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <span>
            These alerts are generated using AI analysis of symptom reports in your area. 
            Stay informed and take preventive measures to protect yourself and your community.
          </span>
        </p>
      </div>
    </div>
  );
}
