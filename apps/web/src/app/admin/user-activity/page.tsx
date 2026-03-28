'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, Clock, TrendingUp, Users } from 'lucide-react';

interface UserActivity {
  userId: string;
  username: string;
  totalSessions: number;
  averageSessionDuration: number;
  lastActive: string;
  activityByHour: Record<string, number>;
  activityByDay: Record<string, number>;
}

export default function AdminUserActivityPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [activityData, setActivityData] = useState<UserActivity | null>(null);
  const [timeframe, setTimeframe] = useState<'hourly' | 'weekly'>('hourly');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserActivity();
    }
  }, [selectedUser, timeframe]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin-user-activity/user/${selectedUser}?timeframe=${timeframe}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (data.success) {
        setActivityData(data.data);
      }
    } catch (error) {
      console.error('Error fetching user activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">User Activity Tracking</h1>
          </div>
          <p className="text-gray-600">Monitor detailed user activity patterns and engagement</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      selectedUser === user.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="font-medium">{user.username || user.email}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {!selectedUser ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Select a user to view their activity</p>
              </div>
            ) : loading ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading activity data...</p>
              </div>
            ) : activityData ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{activityData.username}</h2>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as any)}
                    className="px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <h3 className="text-sm font-medium text-gray-600">Total Sessions</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{activityData.totalSessions}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <h3 className="text-sm font-medium text-gray-600">Avg Session</h3>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {activityData.averageSessionDuration}m
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <h3 className="text-sm font-medium text-gray-600">Last Active</h3>
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {new Date(activityData.lastActive).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Activity by {timeframe === 'hourly' ? 'Hour' : 'Day'}
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(timeframe === 'hourly' ? activityData.activityByHour : activityData.activityByDay).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-gray-600">{key}</div>
                        <div className="flex-1">
                          <div className="bg-gray-200 rounded-full h-6">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${Math.min((value / Math.max(...Object.values(timeframe === 'hourly' ? activityData.activityByHour : activityData.activityByDay))) * 100, 100)}%` }}
                            >
                              <span className="text-xs text-white font-medium">{value}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
