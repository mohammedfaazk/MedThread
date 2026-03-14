'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Users, TrendingUp, Activity, Award, MessageSquare, Eye } from 'lucide-react';
import { DoctorSpecialtyChart } from '@/components/analytics/DoctorSpecialtyChart';
import { CommunityActivityInsights } from '@/components/analytics/CommunityActivityInsights';
import { UserActivityGraphs } from '@/components/admin/UserActivityGraphs';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DoctorPortfolio {
  id: string;
  username: string;
  specialty: string;
  avatar?: string;
  curedPatientCount: number;
  conversionCount: number;
  portfolioScore: number;
  helpfulnessScore: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [topDoctors, setTopDoctors] = useState<DoctorPortfolio[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [doctorDetails, setDoctorDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Load top doctors globally
      const response = await axios.get(`${API_URL}/api/enhanced-analytics/top-doctors`, {
        headers,
        params: { scope: 'global', limit: 10 }
      });

      if (response.data.success) {
        setTopDoctors(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorDetails = async (doctorId: string) => {
    setDetailsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      const response = await axios.get(
        `${API_URL}/api/enhanced-analytics/doctor-portfolio/${doctorId}`,
        { headers }
      );

      if (response.data.success) {
        setDoctorDetails(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to load doctor details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDoctor = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    loadDoctorDetails(doctorId);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive platform analytics and insights</p>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Doctor Specialty Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Doctor Specialty Distribution</h2>
            </div>
            <DoctorSpecialtyChart />
          </div>

          {/* Community Activity Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Community Activity Tiers</h2>
            </div>
            <CommunityActivityInsights />
          </div>
        </div>

        {/* Top Performing Doctors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-gray-900">Top Performing Doctors</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Ranked by portfolio score and patient outcomes</p>
          </div>

          <div className="p-6">
            {!topDoctors || topDoctors.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No doctor data available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id}
                    className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition cursor-pointer"
                    onClick={() => handleViewDoctor(doctor.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          #{index + 1}
                        </div>

                        {/* Doctor Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">{doctor.username}</h3>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                              {doctor.specialty}
                            </span>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Portfolio Score</p>
                              <p className="text-lg font-bold text-green-600">
                                {doctor.portfolioScore > 0 ? '+' : ''}{doctor.portfolioScore}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Patients Cured</p>
                              <p className="text-lg font-bold text-blue-600">{doctor.curedPatientCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Conversions</p>
                              <p className="text-lg font-bold text-purple-600">{doctor.conversionCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Clinic Visits</p>
                              <p className="text-lg font-bold text-orange-600">0</p>
                            </div>
                          </div>

                          {/* Additional Stats */}
                          <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              0 comments
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              0 post-clinic cures
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDoctor(doctor.id);
                        }}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(doctor.id);
                        }}
                        className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                      >
                        <Activity className="w-4 h-4" />
                        Activity Graph
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Doctor Details Modal */}
        {selectedDoctor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Doctor Portfolio Deep-Dive</h2>
                  <button
                    onClick={() => {
                      setSelectedDoctor(null);
                      setDoctorDetails(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6">
                {detailsLoading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading doctor details...</p>
                  </div>
                ) : doctorDetails ? (
                  <div className="space-y-6">
                    {/* Overview Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Portfolio Score</p>
                        <p className="text-2xl font-bold text-green-600">
                          {doctorDetails.performance?.portfolioScore > 0 ? '+' : ''}{doctorDetails.performance?.portfolioScore || 0}
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Patients Cured</p>
                        <p className="text-2xl font-bold text-blue-600">{doctorDetails.curedCount}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Conversions</p>
                        <p className="text-2xl font-bold text-purple-600">{doctorDetails.totalConversions}</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Clinic Visits</p>
                        <p className="text-2xl font-bold text-orange-600">{doctorDetails.performance?.clinicVisitCount || 0}</p>
                      </div>
                    </div>

                    {/* Satisfaction Metrics */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Patient Satisfaction</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">✅ Cured</p>
                          <p className="text-xl font-bold text-green-600">{doctorDetails.curedCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">🔄 In Progress</p>
                          <p className="text-xl font-bold text-yellow-600">{doctorDetails.feedbacks?.filter((f: any) => f.status === 'NOT_YET').length || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">🔀 Switched Doctor</p>
                          <p className="text-xl font-bold text-red-600">{doctorDetails.feedbacks?.filter((f: any) => f.status === 'CONSULT_NEW_DOCTOR').length || 0}</p>
                        </div>
                      </div>
                      {doctorDetails.curedCount + (doctorDetails.feedbacks?.filter((f: any) => f.status === 'CONSULT_NEW_DOCTOR').length || 0) > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">Satisfaction Rate</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {doctorDetails.satisfactionRatio}%
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Comments with Conversions */}
                    {doctorDetails.commentsWithConversions && doctorDetails.commentsWithConversions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Converting Comments</h3>
                        <div className="space-y-3">
                          {doctorDetails.commentsWithConversions.slice(0, 5).map((comment: any) => (
                            <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <p className="text-sm text-gray-700 flex-1">{comment.content}</p>
                                <span className="ml-4 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                                  {comment.conversionCount} conversions
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Posted {new Date(comment.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Failed to load doctor details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User Activity Graphs Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <UserActivityGraphs
              userId={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
