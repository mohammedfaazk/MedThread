'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Activity, MapPin } from 'lucide-react';

interface TrendingSymptom {
  symptom: string;
  count: number;
}

interface HealthAlert {
  id: string;
  region: string;
  topSymptoms: Array<{ symptom: string; count: number }>;
  alertLevel: string;
  totalReports: number;
}

export default function PublicHealthDashboard() {
  const [trending, setTrending] = useState<TrendingSymptom[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [trendingRes, alertsRes] = await Promise.all([
        fetch('/api/health-analytics/trending?timeWindow=daily&limit=10'),
        fetch('/api/health-analytics/geographic-alerts')
      ]);

      const trendingData = await trendingRes.json();
      const alertsData = await alertsRes.json();

      if (trendingData.success) setTrending(trendingData.data);
      if (alertsData.success) setAlerts(alertsData.data);
    } catch (error) {
      console.error('Failed to fetch health analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading health intelligence...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Trending Symptoms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trending Health Issues
          </CardTitle>
          <CardDescription>
            Most reported symptoms in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trending.map((item, index) => (
              <div key={item.symptom} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                  <span className="font-medium capitalize">{item.symptom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <span className="font-semibold">{item.count} reports</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Geographic Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Geographic Health Alerts
          </CardTitle>
          <CardDescription>
            Regions with elevated health concerns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active alerts</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-500" />
                      <h3 className="font-semibold">{alert.region}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      alert.alertLevel === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      alert.alertLevel === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.alertLevel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {alert.totalReports} reports in this region
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {alert.topSymptoms.slice(0, 3).map((symptom: any) => (
                      <span key={symptom.symptom} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                        {symptom.symptom} ({symptom.count})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Advisory */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Health Advisories</CardTitle>
          <CardDescription>
            Automated prevention recommendations based on trending data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trending.slice(0, 3).map((item) => (
              <div key={item.symptom} className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <h4 className="font-semibold mb-1 capitalize">{item.symptom} Alert</h4>
                <p className="text-sm text-gray-700">
                  {item.count}% of users reporting {item.symptom} symptoms. 
                  Stay hydrated, get adequate rest, and consult a doctor if symptoms persist or worsen.
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
