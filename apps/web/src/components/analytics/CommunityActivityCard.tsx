'use client';

import { useState, useEffect } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';

interface CommunityActivityData {
  section: string;
  label: string;
  value: number;
  color: string;
  percentageOfTotal: number;
}

interface CommunityActivityCardProps {
  onLiveUpdate?: () => void;
}

type MetricType = 'posts' | 'comments' | 'interactions' | 'members';
type ChartType = 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';

export default function CommunityActivityCard({ onLiveUpdate }: CommunityActivityCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CommunityActivityData[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('interactions');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [period, setPeriod] = useState('30d');

  const metrics = [
    { key: 'posts' as MetricType, label: 'Posts' },
    { key: 'comments' as MetricType, label: 'Comments' },
    { key: 'interactions' as MetricType, label: 'Interactions' },
    { key: 'members' as MetricType, label: 'Active Members' }
  ];

  const chartTypes: { key: ChartType; label: string }[] = [
    { key: 'bar', label: 'Bar' },
    { key: 'line', label: 'Line' },
    { key: 'pie', label: 'Pie' },
    { key: 'doughnut', label: 'Doughnut' },
    { key: 'radar', label: 'Radar' }
  ];

  useEffect(() => {
    fetchData();
  }, [selectedMetric, period]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${baseUrl}/api/community-analytics/community-section-activity?period=${period}&metric=${selectedMetric}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch community activity data');
      }

      const result = await response.json();
      setData(result.data || []);
    } catch (err: any) {
      console.error('Error fetching community activity:', err);
      // Handle both Error objects and API error responses
      const errorMessage = err?.message || err?.error?.message || 'Failed to load community activity';
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  const handleLiveUpdate = (section: string, metric: MetricType, increment: number = 1) => {
    setData(prevData => {
      return prevData.map(item => {
        if (item.section === section && selectedMetric === metric) {
          return { ...item, value: item.value + increment };
        }
        return item;
      });
    });
    onLiveUpdate?.();
  };

  // Prepare chart data for Recharts format
  const chartData = data.map(d => ({
    name: d.label,
    value: d.value,
    color: d.color
  }));

  const highestValue = Math.max(...data.map(d => d.value), 0);

  if (loading) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#f3f6fa' }}>Community Activity Analytics</h3>
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3 className="error-text font-semibold mb-2">Error Loading Community Activity</h3>
          <p className="error-text">{error}</p>
          <button onClick={fetchData} className="retry-btn mt-4">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      {/* Header with Chart Type Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: '#f3f6fa' }}>Community Activity Analytics</h3>
        
        {/* Chart Type Toggle */}
        <div className="chart-toggle-group">
          {chartTypes.map(type => (
            <button
              key={type.key}
              onClick={() => setChartType(type.key)}
              className={`chart-toggle-btn ${chartType === type.key ? 'active' : ''}`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="filter-group mb-6">
        {metrics.map(metric => (
          <button
            key={metric.key}
            onClick={() => setSelectedMetric(metric.key)}
            className={`filter-pill ${selectedMetric === metric.key ? 'active' : ''}`}
          >
            {metric.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-6 relative" style={{ height: '300px', minHeight: '300px' }}>
        <MultiTypeChart
          data={chartData}
          chartType={chartType}
          dataKey="value"
          xAxisKey="name"
          title=""
          height={300}
          showLegend={false}
        />
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {data.map(item => (
          <div
            key={item.section}
            className="kpi-block"
            style={item.value === highestValue && highestValue > 0 ? {
              borderColor: 'rgba(102, 154, 227, 0.35)',
              background: 'rgba(102, 154, 227, 0.08)'
            } : {}}
          >
            <div className="kpi-label">{item.label}</div>
            <div className="kpi-value text-lg">{item.value}</div>
            <div className="text-xs" style={{ color: '#8899b4' }}>{item.percentageOfTotal}% of total</div>
          </div>
        ))}
      </div>
    </div>
  );
}
