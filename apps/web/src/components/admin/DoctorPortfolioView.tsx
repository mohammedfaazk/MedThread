'use client';

import { useEffect, useState } from 'react';
import { FileText, MessageSquare, TrendingUp, Heart, Award, Calendar } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorPortfolio {
  performance: any;
  commentsWithConversions: any[];
  totalConversions: number;
  feedbacks: any[];
  satisfactionRatio: string;
  curedCount: number;
  totalFeedbacks: number;
}

export function DoctorPortfolioView({ doctorId }: { doctorId: string }) {
  const [portfolio, setPortfolio] = useState<DoctorPortfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, [doctorId]);

  const fetchPortfolio = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_URL}/api/enhanced-analytics/doctor-portfolio/${doctorId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await response.json();
      
      if (result.success) {
        setPortfolio(result.data);
      }
    } catch (error) {
      console.error('Error fetching doctor portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Doctor Portfolio Analytics</h3>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <p className="text-gray-600">No portfolio data available</p>
      </div>
    );
  }

  const { performance, commentsWithConversions, totalConversions, feedbacks, satisfactionRatio, curedCount, totalFeedbacks } = portfolio;

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Performance Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Patients Cured</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{performance?.curedPatientCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Conversions</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{performance?.conversionCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Portfolio Score</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{performance?.portfolioScore || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">Clinic Visits</span>
            </div>
            <p className="text-3xl font-bold text-teal-600">{performance?.clinicVisitCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <MessageSquare className="w-5 h-5" />
              <span className="text-sm font-medium">Total Comments</span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">{performance?.totalCommentsCount || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <FileText className="w-5 h-5" />
              <span className="text-sm font-medium">Satisfaction Ratio</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{satisfactionRatio}%</p>
          </div>
        </div>
      </div>

      {/* Comments with Conversions */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Comments & Conversions</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {commentsWithConversions.slice(0, 20).map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <p className="text-sm text-gray-700 flex-1">{comment.content.substring(0, 150)}...</p>
                <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                  {comment.conversionCount} conversions
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Post: {comment.post.title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Patient Feedbacks */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
        <h3 className="text-xl font-bold mb-4">Patient Feedback History</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-2xl font-bold text-green-600">{curedCount}</p>
            <p className="text-sm text-gray-600">Cured</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {feedbacks.filter(f => f.status === 'NOT_YET').length}
            </p>
            <p className="text-sm text-gray-600">Not Yet</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">
              {feedbacks.filter(f => f.status === 'CONSULT_NEW_DOCTOR').length}
            </p>
            <p className="text-sm text-gray-600">Switched Doctor</p>
          </div>
        </div>
      </div>
    </div>
  );
}
