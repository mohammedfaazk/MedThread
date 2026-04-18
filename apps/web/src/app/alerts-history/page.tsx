'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Share2, Clock, MapPin } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedRegions: string[];
  createdAt: string;
  expiresAt: string;
  isActive: boolean;
}

export default function AlertsHistoryPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/emergency-broadcast/history`);
      const result = await response.json();
      
      if (result.success) {
        setAlerts(result.alerts);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (alert: Alert) => {
    const text = `⚠️ ${alert.title}\n\n${alert.message}\n\nAffected regions: ${alert.affectedRegions.join(', ')}`;
    
    if (navigator.share) {
      navigator.share({
        title: alert.title,
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      window.alert('Alert details copied to clipboard!');
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        window.alert('Please login to acknowledge alerts');
        return;
      }

      const response = await fetch(`${API_URL}/api/v1/emergency-broadcast/${alertId}/acknowledge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        window.alert('Alert marked as read');
      }
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const severityColors = {
    LOW: 'bg-blue-100 text-blue-800 border-blue-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300'
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'active') return alert.isActive;
    if (filter === 'expired') return !alert.isActive;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-red-600" />
            Alert History
          </h1>
          <p className="text-gray-600">View all past and current health alerts</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Alerts ({alerts.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Active ({alerts.filter(a => a.isActive).length})
          </button>
          <button
            onClick={() => setFilter('expired')}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              filter === 'expired'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Expired ({alerts.filter(a => !a.isActive).length})
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4 pb-8">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No alerts found</p>
              <p className="text-sm text-gray-500">Check back later for health updates</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-md transition ${
                  alert.isActive ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          severityColors[alert.severity]
                        }`}
                      >
                        {alert.severity}
                      </span>
                      {alert.isActive && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{alert.title}</h3>
                  </div>
                  <button
                    onClick={() => handleShare(alert)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                    title="Share alert"
                  >
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Alert Message */}
                <p className="text-gray-700 mb-4 leading-relaxed">{alert.message}</p>

                {/* Alert Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>
                      {new Date(alert.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {alert.affectedRegions && alert.affectedRegions.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{alert.affectedRegions.join(', ')}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {alert.isActive && (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
