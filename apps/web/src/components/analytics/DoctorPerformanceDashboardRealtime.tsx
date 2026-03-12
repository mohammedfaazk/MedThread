'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Clock, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import { useAnalyticsSocket } from '@/context/AnalyticsSocketContext';

interface DoctorLeaderboard {
  doctorId: string;
  totalResponses: number;
  totalPatientsHelped: number;
  helpfulnessScore: number;
  avgResponseTime: number;
  activeEngagementScore: number;
  doctor: {
    id: string;
    username: string;
    avatar: string;
    specialty: string;
    yearsOfExperience: number;
  };
}

export default function DoctorPerformanceDashboardRealtime() {
  const { analyticsData, subscribe, unsubscribe, isConnected } = useAnalyticsSocket();
  const [leaderboard, setLeaderboard] = useState<DoctorLeaderboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('helpfulnessScore');

  useEffect(() => {
    // Subscribe to real-time doctor analytics
    subscribe('doctor');

    fetchLeaderboard();

    return () => {
      unsubscribe('doctor');
    };
  }, [sortBy]);

  // Update from real-time socket data
  useEffect(() => {
    if (analyticsData.doctor.leaderboard.length > 0) {
      setLeaderboard(analyticsData.doctor.leaderboard);
      setLoading(false);
    }
  }, [analyticsData.doctor]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/doctor-analytics/leaderboard?limit=10&sortBy=${sortBy}`);
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading doctor performance data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-sm">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
        <span className="text-gray-600">
          {isConnected ? 'Real-time updates active' : 'Connecting...'}
        </span>
      </div>

      {/* Top Doctors Leaderboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Doctors Leaderboard
                <span className="ml-2 text-xs font-normal text-gray-500">Live</span>
              </CardTitle>
              <CardDescription>
                Highest performing doctors based on real-time patient feedback
              </CardDescription>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="helpfulnessScore">Helpfulness</option>
              <option value="activeEngagementScore">Engagement</option>
              <option value="totalPatientsHelped">Patients Helped</option>
              <option value="avgResponseTime">Response Time</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((doctor, index) => (
              <div key={doctor.doctorId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div className="text-2xl font-bold text-gray-400 w-8">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && `#${index + 1}`}
                </div>

                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  {doctor.doctor?.avatar ? (
                    <Image
                      src={doctor.doctor.avatar}
                      alt={doctor.doctor.username}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {doctor.doctor?.username?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold">{doctor.doctor?.username}</h3>
                  <p className="text-sm text-gray-600">
                    {doctor.doctor?.specialty} • {doctor.doctor?.yearsOfExperience} years exp
                  </p>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-yellow-500 font-semibold">
                      <Star className="w-4 h-4 fill-current" />
                      {doctor.helpfulnessScore?.toFixed(1) || 'N/A'}
                    </div>
                    <p className="text-gray-500 text-xs">Rating</p>
                  </div>

                  <div className="text-center">
                    <div className="font-semibold text-green-600">
                      {doctor.totalPatientsHelped}
                    </div>
                    <p className="text-gray-500 text-xs">Helped</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 font-semibold text-blue-600">
                      <Clock className="w-4 h-4" />
                      {doctor.avgResponseTime ? `${Math.round(doctor.avgResponseTime)}m` : 'N/A'}
                    </div>
                    <p className="text-gray-500 text-xs">Avg Response</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center gap-1 font-semibold text-purple-600">
                      <TrendingUp className="w-4 h-4" />
                      {doctor.activeEngagementScore?.toFixed(0) || 'N/A'}
                    </div>
                    <p className="text-gray-500 text-xs">Engagement</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Active Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{leaderboard.length}</p>
            <p className="text-sm text-gray-500 mt-1">In the last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leaderboard.length > 0
                ? Math.round(
                    leaderboard.reduce((sum, d) => sum + (d.avgResponseTime || 0), 0) / leaderboard.length
                  )
                : 0}m
            </p>
            <p className="text-sm text-gray-500 mt-1">Platform average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Patients Helped</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {leaderboard.reduce((sum, d) => sum + d.totalPatientsHelped, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total this month</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
