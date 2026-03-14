'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Activity, Users } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorProfileGraphsProps {
  doctorId: string;
}

interface PatientAcquisitionData {
  registrationDate: string;
  totalPatients: number;
  monthlyGrowth: Array<{
    month: string;
    monthName: string;
    cumulativePatients: number;
    newPatients: number;
  }>;
}

interface ReplyTimeData {
  averageReplyHours: number;
  displayText: string;
  totalReplies: number;
  medianReplyHours: number;
}

interface DailyActivityData {
  hourlyPattern: Array<{
    hour: number;
    hourLabel: string;
    totalActivity: number;
    messages: number;
    comments: number;
    posts: number;
  }>;
  totalActivities: number;
  lastActiveText: string;
  peakHour: {
    hour: number;
    hourLabel: string;
    totalActivity: number;
  };
}

export function DoctorProfileGraphs({ doctorId }: DoctorProfileGraphsProps) {
  const [patientAcquisition, setPatientAcquisition] = useState<PatientAcquisitionData | null>(null);
  const [replyTime, setReplyTime] = useState<ReplyTimeData | null>(null);
  const [dailyActivity, setDailyActivity] = useState<DailyActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorAnalytics();
  }, [doctorId]);

  const fetchDoctorAnalytics = async () => {
    setLoading(true);
    try {
      const [acquisitionRes, replyTimeRes, activityRes] = await Promise.all([
        fetch(`${API_URL}/api/doctor-profile-analytics/patient-acquisition/${doctorId}`),
        fetch(`${API_URL}/api/doctor-profile-analytics/reply-time/${doctorId}`),
        fetch(`${API_URL}/api/doctor-profile-analytics/daily-activity/${doctorId}`)
      ]);

      const [acquisitionData, replyTimeData, activityData] = await Promise.all([
        acquisitionRes.json(),
        replyTimeRes.json(),
        activityRes.json()
      ]);

      if (acquisitionData.success) setPatientAcquisition(acquisitionData.data);
      if (replyTimeData.success) setReplyTime(replyTimeData.data);
      if (activityData.success) setDailyActivity(activityData.data);
    } catch (error) {
      console.error('Error fetching doctor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Acquisition Graph */}
      {patientAcquisition && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Patient Acquisition Growth</h3>
              <p className="text-sm text-gray-600">
                {patientAcquisition.totalPatients} total patients since joining
              </p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={patientAcquisition.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="monthName" 
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
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'cumulativePatients' ? 'Total Patients' : 'New Patients'
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulativePatients" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Average Reply Time */}
      {replyTime && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
              <p className="text-sm text-gray-600">
                Based on {replyTime.totalReplies} patient conversations
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {replyTime.displayText}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average</p>
                  <p className="text-lg font-semibold text-green-600">
                    {replyTime.averageReplyHours.toFixed(1)}h
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Median</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {replyTime.medianReplyHours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Daily Activity Pattern */}
      {dailyActivity && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Daily Activity Pattern</h3>
                <p className="text-sm text-gray-600">
                  Activity by hour of day (last 30 days)
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Peak Activity</p>
              <p className="text-lg font-semibold text-purple-600">
                {dailyActivity.peakHour.hourLabel}
              </p>
            </div>
          </div>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity.hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="hourLabel" 
                  tick={{ fontSize: 10 }}
                  stroke="#666"
                  interval={1}
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
                  formatter={(value: number) => [value, 'Activities']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Bar 
                  dataKey="totalActivity" 
                  fill="#8b5cf6"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{dailyActivity.totalActivities}</span> total activities
            </div>
            <div className="text-sm text-gray-600">
              {dailyActivity.lastActiveText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}