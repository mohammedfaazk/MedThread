'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Calendar, Activity, User } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UserActivityGraphsProps {
  userId: string;
  onClose?: () => void;
}

interface UserActivityData {
  user: {
    id: string;
    username: string;
    role: string;
    memberSince: string;
  };
  timeframe: 'hourly' | 'weekly';
  period: string;
  hourlyPattern?: Array<{
    hour: number;
    hourLabel: string;
    totalActivity: number;
    posts: number;
    comments: number;
    messages: number;
    votes: number;
  }>;
  weeklyPattern?: Array<{
    day: number;
    dayName: string;
    dayShort: string;
    totalActivity: number;
    posts: number;
    comments: number;
    messages: number;
    votes: number;
  }>;
  peakActivity: {
    hour?: number;
    day?: number;
    hourLabel?: string;
    dayName?: string;
    activityCount: number;
  };
  summary: {
    totalActivities: number;
    averagePerDay?: string;
    averagePerWeek?: string;
    activityByType: {
      posts: number;
      comments: number;
      messages: number;
      votes: number;
    };
    mostActiveHours?: Array<{
      hour: number;
      label: string;
      count: number;
    }>;
    mostActiveDays?: Array<{
      day: number;
      name: string;
      count: number;
    }>;
  };
}

export function UserActivityGraphs({ userId, onClose }: UserActivityGraphsProps) {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null);
  const [timeframe, setTimeframe] = useState<'hourly' | 'weekly'>('hourly');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity();
  }, [userId, timeframe]);

  const fetchUserActivity = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/admin-user-activity/user/${userId}?timeframe=${timeframe}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();
      if (result.success) {
        setActivityData(result.data);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!activityData) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <p className="text-gray-600">No activity data available for this user.</p>
      </div>
    );
  }

  const chartData = (timeframe === 'hourly' 
    ? activityData.hourlyPattern 
    : activityData.weeklyPattern) as any;

  const xAxisKey = timeframe === 'hourly' ? 'hourLabel' : 'dayShort';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                User Activity Analysis
              </h2>
              <p className="text-sm text-gray-600">
                @{activityData.user.username} • {activityData.user.role} • {activityData.period}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timeframe Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setTimeframe('hourly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  timeframe === 'hourly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Hourly
              </button>
              <button
                onClick={() => setTimeframe('weekly')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition ${
                  timeframe === 'weekly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                Weekly
              </button>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-sm font-medium">Total Activity</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {activityData.summary.totalActivities}
            </p>
            <p className="text-xs text-gray-500">
              {timeframe === 'hourly' 
                ? `${activityData.summary.averagePerDay} per day`
                : `${activityData.summary.averagePerWeek} per week`
              }
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-sm font-medium">Peak {timeframe === 'hourly' ? 'Hour' : 'Day'}</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {timeframe === 'hourly' 
                ? activityData.peakActivity.hourLabel
                : activityData.peakActivity.dayName
              }
            </p>
            <p className="text-xs text-gray-500">
              {activityData.peakActivity.activityCount} activities
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-sm font-medium">Posts</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {activityData.summary.activityByType.posts}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-sm font-medium">Comments</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {activityData.summary.activityByType.comments}
            </p>
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Pattern - {timeframe === 'hourly' ? 'By Hour of Day' : 'By Day of Week'}
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={xAxisKey}
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#666"
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value: any, name: any) => [
                    value,
                    name.charAt(0).toUpperCase() + name.slice(1)
                  ]}
                />
                <Bar dataKey="totalActivity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="posts" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="messages" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Activity Breakdown</h4>
            <div className="space-y-3">
              {Object.entries(activityData.summary.activityByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(count / activityData.summary.totalActivities) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Most Active {timeframe === 'hourly' ? 'Hours' : 'Days'}
            </h4>
            <div className="space-y-3">
              {(timeframe === 'hourly' 
                ? activityData.summary.mostActiveHours 
                : activityData.summary.mostActiveDays
              )?.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {timeframe === 'hourly' 
                        ? (item as any).label 
                        : (item as any).name
                      }
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {(item as any).count} activities
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Member since {new Date(activityData.user.memberSince).toLocaleDateString()}
              </p>
              <p className="text-xs text-blue-700">
                Role: {activityData.user.role} • User ID: {activityData.user.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}