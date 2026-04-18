'use client';

import { useState, useEffect } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';
import KPIBadge from '@/components/analytics/KPIBadge';
import LiveIndicator from '@/components/analytics/LiveIndicator';
import AnalyticsToast from '@/components/analytics/AnalyticsToast';
import CommunityActivityCard from '@/components/analytics/CommunityActivityCard';
import { useAnalyticsEvents, AnalyticsEvent } from '@/hooks/useAnalyticsEvents';
import '@/styles/glassmorphic-analytics.css';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({});
  const [period, setPeriod] = useState('online'); // Changed from 'today' to 'online' for session-based tracking
  const [liveUpdateCount, setLiveUpdateCount] = useState(0);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: AnalyticsEvent['type'] }>>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const addToast = (message: string, type: AnalyticsEvent['type']) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Update last updated timestamp
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 30) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Connect to real-time analytics events
  const { isConnected, lastEvent } = useAnalyticsEvents({
    onEvent: (event) => {
      console.log('📊 Real-time analytics event:', event);
      setLiveUpdateCount(prev => prev + 1);
      setLastUpdated(new Date());
      
      // Show toast notification
      let message = '';
      switch (event.type) {
        case 'user:registered':
          message = `New ${event.data.role.toLowerCase()} registered`;
          break;
        case 'user:active':
          message = `${event.data.role} user logged in`;
          break;
        case 'post:created':
          message = `New ${event.data.priority} priority post created`;
          break;
        case 'appointment:booked':
          message = 'New appointment booked';
          break;
        case 'report:filed':
          message = `New report filed: ${event.data.reason}`;
          break;
      }
      addToast(message, event.type);
      
      // Refresh specific metrics based on event type
      if (event.type === 'user:registered' || event.type === 'user:active') {
        fetchAllAnalytics();
      } else if (event.type === 'post:created') {
        fetchAllAnalytics();
      } else if (event.type === 'appointment:booked') {
        fetchAllAnalytics();
      } else if (event.type === 'report:filed') {
        fetchAllAnalytics();
      }
    },
    onConnect: () => {
      console.log('✅ Connected to real-time analytics');
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from real-time analytics');
    }
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, [period]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        setError('Authentication required. Please login first.');
        setLoading(false);
        return;
      }
      
      const endpoints = [
        `active-users?period=${period}`,
        'offline-users',
        'user-activity-time?days=7',
        'feature-usage?days=30',
        'treatment-outcomes',
        'doctor-activity-by-community',
        'dead-forums',
        'user-registrations?months=12',
        'post-priorities?months=6',
        'appointment-conversion',
        'moderation-activity?weeks=12',
        'revenue?months=12'
      ];

      const results = await Promise.all(
        endpoints.map(endpoint =>
          fetch(`${baseUrl}/api/admin-analytics/${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
          }).then(res => {
            if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
            return res.json();
          })
        )
      );

      setData({
        activeUsers: results[0].data,
        offlineUsers: results[1].data,
        userActivityTime: results[2].data,
        featureUsage: results[3].data,
        treatmentOutcomes: results[4].data,
        doctorActivity: results[5].data,
        deadForums: results[6].data,
        userRegistrations: results[7].data,
        postPriorities: results[8].data,
        appointmentConversion: results[9].data,
        moderationActivity: results[10].data,
        revenue: results[11].data
      });
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      // Handle both Error objects and API error responses
      const errorMessage = err?.message || err?.error?.message || 'Failed to load analytics data';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="ambient-orb-bottom" />
        <div className="dashboard-content p-6">
          <h1 className="dashboard-title mb-6">Admin Analytics Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="glass-card p-6">
                <ChartSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="ambient-orb-bottom" />
        <div className="dashboard-content p-6">
          <div className="error-state glass-card p-6">
            <div className="error-icon">⚠️</div>
            <h2 className="error-text font-semibold mb-2">Error Loading Analytics</h2>
            <p className="error-text">{error}</p>
            <button onClick={fetchAllAnalytics} className="retry-btn mt-4">
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="ambient-orb-bottom" />
      <div className="dashboard-content p-6">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Admin Analytics Dashboard</h1>
            <div className="flex items-center gap-3 mt-2">
              <LiveIndicator isLive={isConnected} />
              {liveUpdateCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-full" style={{ 
                  background: 'rgba(102, 154, 227, 0.1)', 
                  border: '1px solid rgba(102, 154, 227, 0.2)',
                  color: '#669ae3'
                }}>
                  {liveUpdateCount} live updates
                </span>
              )}
              <span className="last-updated">
                Last updated: {getTimeAgo(lastUpdated)}
              </span>
            </div>
          </div>
          
          {/* Period Selector */}
          <div className="filter-group">
            {['today', '7days', '30days'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`filter-pill ${period === p ? 'active' : ''}`}
              >
                {p === 'today' ? 'Today' : p === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Active Users */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={[
                { name: 'Doctors', value: data.activeUsers?.doctors || 0 },
                { name: 'Patients', value: data.activeUsers?.patients || 0 }
              ]}
              dataKey="value"
              title="Active Users"
              storageKey="admin-active-users"
              height={300}
            />
            <KPIBadge
              value={data.activeUsers?.total || 0}
              label="Total Active Users"
              trend={{
                direction: 'up',
                percentage: 12.5
              }}
            />
          </div>

          {/* 2. Offline Users */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={[
                { name: 'Doctors', value: data.offlineUsers?.doctors || 0 },
                { name: 'Patients', value: data.offlineUsers?.patients || 0 }
              ]}
              dataKey="value"
              title="Offline Users"
              storageKey="admin-offline-users"
              height={300}
            />
            <KPIBadge
              value={data.offlineUsers?.total || 0}
              label="Total Offline Users"
            />
          </div>

          {/* 3. User Activity by Time */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.userActivityTime || []}
              dataKey="doctors"
              xAxisKey="hour"
              title="User Activity by Time of Day"
              storageKey="admin-user-activity-time"
              height={300}
              multiSeries={[
                { key: 'doctors', name: 'Doctors', color: '#669ae3' },
                { key: 'patients', name: 'Patients', color: '#1ecb6b' }
              ]}
            />
            <KPIBadge
              value="9-11 AM"
              label="Peak Activity Hours"
            />
          </div>

          {/* 4. Community Activity Analytics */}
          <CommunityActivityCard 
            onLiveUpdate={() => setLiveUpdateCount(prev => prev + 1)}
          />

          {/* 5. Treatment Outcomes */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.treatmentOutcomes || []}
              dataKey="value"
              xAxisKey="name"
              title="Patient Treatment Outcomes"
              storageKey="admin-treatment-outcomes"
              height={300}
            />
            <KPIBadge
              value={data.treatmentOutcomes?.find((item: any) => item.name === 'Improved')?.value || 0}
              label="Patients Improved"
              trend={{
                direction: 'up',
                percentage: 8.2
              }}
            />
          </div>

          {/* 6. Doctor Activity by Community */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.doctorActivity || []}
              dataKey="total"
              xAxisKey="name"
              title="Doctor Activity by Community"
              storageKey="admin-doctor-activity"
              height={300}
              multiSeries={[
                { key: 'posts', name: 'Posts', color: '#669ae3' },
                { key: 'comments', name: 'Comments', color: '#1ecb6b' }
              ]}
            />
            <KPIBadge
              value={data.doctorActivity?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0}
              label="Total Doctor Contributions"
            />
          </div>

          {/* 7. Dead Forums */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.deadForums || []}
              dataKey="engagementScore"
              xAxisKey="name"
              title="Community Engagement Scores"
              storageKey="admin-dead-forums"
              height={300}
            />
            <KPIBadge
              value={data.deadForums?.reduce((sum: number, item: any) => sum + (item.engagementScore || 0), 0) / (data.deadForums?.length || 1) || 0}
              label="Average Engagement Score"
              format="number"
            />
          </div>

          {/* 8. User Registrations */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.userRegistrations || []}
              dataKey="total"
              xAxisKey="month"
              title="New User Registrations"
              storageKey="admin-user-registrations"
              height={300}
              multiSeries={[
                { key: 'doctors', name: 'Doctors', color: '#669ae3' },
                { key: 'patients', name: 'Patients', color: '#1ecb6b' }
              ]}
            />
            <KPIBadge
              value={data.userRegistrations?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0}
              label="Total New Users (12 Months)"
              trend={{
                direction: 'up',
                percentage: 24.7
              }}
            />
          </div>

          {/* 9. Post Priorities */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.postPriorities || []}
              dataKey="value"
              xAxisKey="name"
              title="Post Priority Distribution"
              storageKey="admin-post-priorities"
              height={300}
            />
            <KPIBadge
              value={data.postPriorities?.find((item: any) => item.name === 'HIGH')?.value || 0}
              label="High Priority Posts"
              trend={{
                direction: 'down',
                percentage: 5.3
              }}
            />
          </div>

          {/* 10. Appointment Conversion */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={(data.appointmentConversion || []).slice(0, 10)}
              dataKey="conversionRate"
              xAxisKey="name"
              title="Top 10 Appointment Conversion Rates"
              storageKey="admin-appointment-conversion"
              height={300}
            />
            <KPIBadge
              value={data.appointmentConversion?.[0]?.conversionRate || 0}
              label="Top Conversion Rate"
              format="percentage"
            />
          </div>

          {/* 11. Moderation Activity */}
          <div className="glass-card p-6 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.moderationActivity || []}
              dataKey="filed"
              xAxisKey="week"
              title="Report & Moderation Activity"
              storageKey="admin-moderation-activity"
              height={300}
              multiSeries={[
                { key: 'filed', name: 'Filed', color: '#f5a623' },
                { key: 'resolved', name: 'Resolved', color: '#1ecb6b' },
                { key: 'dismissed', name: 'Dismissed', color: '#ff4d6a' }
              ]}
            />
            <KPIBadge
              value={data.moderationActivity?.reduce((sum: number, item: any) => sum + (item.filed || 0), 0) || 0}
              label="Total Reports Filed"
            />
          </div>

          {/* 12. Revenue Overview */}
          <div className="glass-card p-6 col-span-1 md:col-span-2 relative">
            <div className="absolute top-4 right-4">
              <LiveIndicator isLive={isConnected} />
            </div>
            <MultiTypeChart
              data={data.revenue || []}
              dataKey="total"
              xAxisKey="month"
              title="Revenue Overview (Monthly)"
              storageKey="admin-revenue"
              height={300}
            />
            <KPIBadge
              value={data.revenue?.reduce((sum: number, item: any) => sum + (item.total || 0), 0) || 0}
              label="Total Revenue (12 Months)"
              format="currency"
              trend={{
                direction: 'up',
                percentage: 18.3
              }}
            />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map(toast => (
        <AnalyticsToast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}
