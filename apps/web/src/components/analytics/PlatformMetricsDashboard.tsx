'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Activity, Clock, AlertCircle } from 'lucide-react';

interface PeakUsage {
  peakHours: Record<number, number>;
  peakDays: Record<number, number>;
  averageActiveUsers: number;
}

interface Bottlenecks {
  highBouncePosts: Array<{ id: string; postId: string; bounceRate: number }>;
  slowDoctors: Array<{ doctorId: string; avgResponseTime: number }>;
}

export default function PlatformMetricsDashboard() {
  const [peakUsage, setPeakUsage] = useState<PeakUsage | null>(null);
  const [bottlenecks, setBottlenecks] = useState<Bottlenecks | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('[PlatformMetrics] Fetching data...');
      const [peakRes, bottleneckRes] = await Promise.all([
        fetch('/api/platform-analytics/peak-usage?days=30'),
        fetch('/api/platform-analytics/bottlenecks')
      ]);

      const peakData = await peakRes.json();
      const bottleneckData = await bottleneckRes.json();

      console.log('[PlatformMetrics] Peak data:', peakData);
      console.log('[PlatformMetrics] Bottleneck data:', bottleneckData);

      if (peakData.success) {
        console.log('[PlatformMetrics] Setting peak usage:', peakData.data);
        setPeakUsage(peakData.data);
      }
      if (bottleneckData.success) {
        console.log('[PlatformMetrics] Setting bottlenecks:', bottleneckData.data);
        setBottlenecks(bottleneckData.data);
      }
    } catch (error) {
      console.error('[PlatformMetrics] Failed to fetch platform metrics:', error);
    } finally {
      console.log('[PlatformMetrics] Setting loading to false');
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading platform metrics...</div>;
  }

  console.log('[PlatformMetrics] Rendering with state:', { peakUsage, bottlenecks });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="space-y-6">
      {/* Peak Usage Times */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Peak Usage Analytics
          </CardTitle>
          <CardDescription>
            When patients need help most
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!peakUsage ? (
            <div className="text-center py-8 text-gray-500">
              No peak usage data available
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Peak Hours</h3>
                  <div className="space-y-2">
                    {Object.entries(peakUsage.peakHours)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .slice(0, 5)
                      .map(([hour, count]) => (
                        <div key={hour} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{hour}:00 - {parseInt(hour) + 1}:00</span>
                          <span className="font-semibold">{count} sessions</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Peak Days</h3>
                  <div className="space-y-2">
                    {Object.entries(peakUsage.peakDays)
                      .sort(([, a], [, b]) => (b as number) - (a as number))
                      .map(([day, count]) => (
                        <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span>{dayNames[parseInt(day)]}</span>
                          <span className="font-semibold">{count} active users</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-semibold">Average Active Users:</span>{' '}
                  {peakUsage.averageActiveUsers.toFixed(0)} per day
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Platform Bottlenecks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Platform Bottlenecks
          </CardTitle>
          <CardDescription>
            Areas needing attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!bottlenecks ? (
            <div className="text-center py-8 text-gray-500">
              No bottleneck data available
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">High Bounce Rate Posts</h3>
                {bottlenecks.highBouncePosts.length === 0 ? (
                  <p className="text-gray-500 text-sm">No issues detected</p>
                ) : (
                  <div className="space-y-2">
                    {bottlenecks.highBouncePosts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-3 bg-red-50 rounded">
                        <span className="text-sm">Post ID: {post.postId.slice(0, 8)}...</span>
                        <span className="font-semibold text-red-600">{post.bounceRate}% bounce</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold mb-3">Slow Response Times</h3>
                {bottlenecks.slowDoctors.length === 0 ? (
                  <p className="text-gray-500 text-sm">All doctors responding quickly</p>
                ) : (
                  <div className="space-y-2">
                    {bottlenecks.slowDoctors.slice(0, 5).map((doctor) => (
                      <div key={doctor.doctorId} className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                        <span className="text-sm">Doctor ID: {doctor.doctorId.slice(0, 8)}...</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="font-semibold text-yellow-600">
                            {Math.round(doctor.avgResponseTime)} min avg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {peakUsage?.averageActiveUsers ? peakUsage.averageActiveUsers.toFixed(0) : '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Daily active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Response Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {bottlenecks && bottlenecks.slowDoctors.length === 0 ? 'Good' : 'Needs Attention'}
            </p>
            <p className="text-sm text-gray-500 mt-1">Overall platform health</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Issues Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">
              {bottlenecks 
                ? (bottlenecks.highBouncePosts.length + bottlenecks.slowDoctors.length)
                : 0
              }
            </p>
            <p className="text-sm text-gray-500 mt-1">Requiring attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
