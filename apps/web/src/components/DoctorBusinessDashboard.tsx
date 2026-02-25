'use client'

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Star, Eye, 
  Calendar, Award, Target, Zap, Crown, Megaphone, ArrowUp
} from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Analytics {
  totals: {
    profileViews: number;
    consultationRequests: number;
    consultationsCompleted: number;
    revenue: number;
    netRevenue: number;
    newPatients: number;
    returningPatients: number;
  };
  averages: {
    conversionRate: number;
    rating: number;
    retentionRate: number;
  };
  ratingTrend: {
    trend: 'increasing' | 'stable' | 'decreasing';
    change: string;
  };
}

interface Promotion {
  id: number;
  promotion_type: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
  ctr: number;
  total_price: number;
}

export default function DoctorBusinessDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [revenue, setRevenue] = useState<any>(null);
  const [retention, setRetention] = useState<any>(null);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'patients' | 'marketing'>('overview');
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [analyticsRes, revenueRes, retentionRes, promotionsRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctor-business/analytics`, config),
        axios.get(`${API_URL}/api/doctor-business/revenue`, config),
        axios.get(`${API_URL}/api/doctor-business/retention`, config),
        axios.get(`${API_URL}/api/doctor-business/promotions`, config)
      ]);

      if (analyticsRes.data.success) setAnalytics(analyticsRes.data.data);
      if (revenueRes.data.success) setRevenue(revenueRes.data.data);
      if (retentionRes.data.success) setRetention(retentionRes.data.data);
      if (promotionsRes.data.success) setPromotions(promotionsRes.data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'increasing') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Business Dashboard</h1>
          <p className="text-gray-600">Track your performance and grow your practice</p>
        </div>
        <button
          onClick={() => setShowPromotionModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2"
        >
          <Megaphone className="w-5 h-5" />
          Promote Profile
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('revenue')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'revenue'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Revenue
        </button>
        <button
          onClick={() => setActiveTab('patients')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'patients'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Patients
        </button>
        <button
          onClick={() => setActiveTab('marketing')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'marketing'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Marketing
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Profile Views</span>
                <Eye className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold">{analytics.totals.profileViews.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">From rating site</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Conversion Rate</span>
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-3xl font-bold">{analytics.averages.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-500 mt-1">
                {analytics.totals.consultationsCompleted} / {analytics.totals.consultationRequests} consultations
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Net Revenue</span>
                <DollarSign className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold">${analytics.totals.netRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-500 mt-1">After platform fees</div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Average Rating</span>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">{analytics.averages.rating.toFixed(1)}</div>
                {getTrendIcon(analytics.ratingTrend.trend)}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {analytics.ratingTrend.trend === 'increasing' ? '+' : analytics.ratingTrend.trend === 'decreasing' ? '' : '±'}
                {analytics.ratingTrend.change} this period
              </div>
            </div>
          </div>

          {/* Patient Metrics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Patient Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">New Patients</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totals.newPatients}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Returning Patients</span>
                </div>
                <div className="text-2xl font-bold">{analytics.totals.returningPatients}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold">Retention Rate</span>
                </div>
                <div className="text-2xl font-bold">{analytics.averages.retentionRate.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && revenue && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              {revenue.breakdown.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold capitalize">{item.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">{item.count} transactions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">${item.net.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">{item.percentage}% of total</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Net Revenue</span>
                <span className="text-2xl font-bold text-green-600">${revenue.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patients Tab */}
      {activeTab === 'patients' && retention && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold mb-4">Patient Retention Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {retention.breakdown.map((item: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="font-semibold capitalize mb-2">{item.status.replace('_', ' ')}</div>
                  <div className="text-3xl font-bold mb-2">{item.count}</div>
                  <div className="text-sm text-gray-600 mb-3">{item.percentage}% of patients</div>
                  <div className="space-y-1 text-sm">
                    <div>Avg consultations: {item.avgConsultations}</div>
                    <div>Avg revenue: ${item.avgRevenue}</div>
                    <div>Days since visit: {item.avgDaysSinceVisit}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-lg font-semibold">Total Patients: {retention.totalPatients}</div>
            </div>
          </div>
        </div>
      )}

      {/* Marketing Tab */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          {/* Promotion Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <ArrowUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Top Search</h4>
                  <p className="text-sm text-gray-600">Promote to top</p>
                </div>
              </div>
              <p className="text-sm mb-4">Appear at the top of search results for your specialty and location.</p>
              <div className="text-2xl font-bold mb-2">$50/day</div>
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Featured Badge</h4>
                  <p className="text-sm text-gray-600">Stand out</p>
                </div>
              </div>
              <p className="text-sm mb-4">Get a premium featured badge on your profile to build trust.</p>
              <div className="text-2xl font-bold mb-2">$30/day</div>
              <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                Get Started
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold">Sponsored Answers</h4>
                  <p className="text-sm text-gray-600">Boost visibility</p>
                </div>
              </div>
              <p className="text-sm mb-4">Highlight your answers in public threads to reach more patients.</p>
              <div className="text-2xl font-bold mb-2">$20/day</div>
              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                Get Started
              </button>
            </div>
          </div>

          {/* Active Promotions */}
          {promotions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold mb-4">Active Promotions</h3>
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{promo.title}</h4>
                        <p className="text-sm text-gray-600 capitalize">{promo.promotion_type.replace('_', ' ')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        promo.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Impressions</div>
                        <div className="font-semibold">{promo.impressions.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Clicks</div>
                        <div className="font-semibold">{promo.clicks.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">CTR</div>
                        <div className="font-semibold">{promo.ctr.toFixed(2)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Spent</div>
                        <div className="font-semibold">${promo.total_price.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      {new Date(promo.start_date).toLocaleDateString()} - {new Date(promo.end_date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
