'use client';

import { useState, useEffect } from 'react';
import { OutbreakAlertDashboard } from '@/components/unique/OutbreakAlertDashboard';

export default function OutbreakAlertsPage() {
  const [location, setLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location from localStorage or IP
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    } else {
      setLocation('India'); // Default
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading outbreak data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Outbreak Alerts</h1>
          <p className="mt-2 text-gray-600">
            Real-time disease outbreak detection and regional health trends
          </p>
        </div>

        <OutbreakAlertDashboard location={location} />
      </div>
    </div>
  );
}
