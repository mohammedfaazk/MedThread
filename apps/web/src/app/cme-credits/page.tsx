'use client';

import { useState, useEffect } from 'react';
import { useJWTAuth } from '@/context/JWTAuthContext';
import { useRouter } from 'next/navigation';
import { Award, BookOpen, Calendar, CheckCircle, Clock, TrendingUp } from 'lucide-react';

interface CMEActivity {
  id: string;
  title: string;
  category: string;
  credits: number;
  completedAt: string;
  certificateUrl?: string;
}

interface CMEStats {
  totalCredits: number;
  creditsThisYear: number;
  activitiesCompleted: number;
  requiredCredits: number;
  categories: { [key: string]: number };
}

export default function CMECreditsPage() {
  const { user } = useJWTAuth();
  const router = useRouter();
  const [activities, setActivities] = useState<CMEActivity[]>([]);
  const [stats, setStats] = useState<CMEStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'available'>('overview');

  useEffect(() => {
    if (user) {
      if (user.role !== 'DOCTOR' && user.role !== 'ADMIN') {
        router.push('/');
        return;
      }
      fetchCMEData();
    }
  }, [user]);

  const fetchCMEData = async () => {
    try {
      const [activitiesRes, statsRes] = await Promise.all([
        fetch(`/api/cme-credits/activities/${user?.id}`),
        fetch(`/api/cme-credits/stats/${user?.id}`)
      ]);

      const activitiesData = await activitiesRes.json();
      const statsData = await statsRes.json();

      setActivities(activitiesData.activities || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('Error fetching CME data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Sign in to access CME Credits</h2>
          <button
            onClick={() => router.push('/login')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading CME credits...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = stats 
    ? Math.min((stats.creditsThisYear / stats.requiredCredits) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CME Credits Tracker</h1>
          <p className="text-gray-600">
            Track your Continuing Medical Education credits and maintain certification
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold">{stats.totalCredits}</span>
              </div>
              <p className="text-gray-600 text-sm">Total Credits</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="text-2xl font-bold">{stats.creditsThisYear}</span>
              </div>
              <p className="text-gray-600 text-sm">Credits This Year</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold">{stats.activitiesCompleted}</span>
              </div>
              <p className="text-gray-600 text-sm">Activities Completed</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-8 w-8 text-orange-600" />
                <span className="text-2xl font-bold">{stats.requiredCredits - stats.creditsThisYear}</span>
              </div>
              <p className="text-gray-600 text-sm">Credits Remaining</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Annual Progress</h3>
              <span className="text-sm text-gray-600">
                {stats.creditsThisYear} / {stats.requiredCredits} credits
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {progressPercentage >= 100 
                ? '🎉 You\'ve met your annual requirement!' 
                : `${(100 - progressPercentage).toFixed(0)}% remaining to meet annual requirement`}
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'activities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              My Activities
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 border-b-2 ${
                activeTab === 'available'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600'
              }`}
            >
              Available Courses
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Credits by Category</h3>
              <div className="space-y-3">
                {Object.entries(stats.categories).map(([category, credits]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-gray-600">{credits} credits</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(credits / stats.totalCredits) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
              <div className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-gray-600">
                        {activity.credits} credits • {new Date(activity.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Credits</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-gray-400" />
                          <span className="font-medium">{activity.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          {activity.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold">{activity.credits}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(activity.completedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        {activity.certificateUrl ? (
                          <a
                            href={activity.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Download
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activities.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No activities completed yet. Start learning to earn credits!
              </div>
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-600 mb-6">
                Browse and enroll in CME courses directly from MedThread
              </p>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Notify Me When Available
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
