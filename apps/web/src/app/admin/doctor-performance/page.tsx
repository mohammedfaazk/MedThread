'use client';

import { useState, useEffect } from 'react';
import MultiTypeChart from '@/components/charts/MultiTypeChart';
import ChartSkeleton from '@/components/charts/ChartSkeleton';
import KPIBadge from '@/components/analytics/KPIBadge';
import LiveIndicator from '@/components/analytics/LiveIndicator';
import { DoctorProfileGraphs } from '@/components/doctor/DoctorProfileGraphs';
import { Trophy, TrendingUp, Users, Activity, Star, Award, Target, Zap, X, Search } from 'lucide-react';
import '@/styles/glassmorphic-analytics.css';

interface DoctorPerformance {
  id: string;
  username: string;
  specialty: string;
  portfolioScore: number;
  treatmentSuccessRate: number;
  totalPatients: number;
  totalPosts: number;
  totalComments: number;
  conversionRate: number;
  responseTime: number;
  rating: number;
  rank: number;
}

export default function DoctorPerformancePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topDoctors, setTopDoctors] = useState<DoctorPerformance[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDoctorInfo, setSelectedDoctorInfo] = useState<DoctorPerformance | null>(null);
  const [period, setPeriod] = useState('30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DoctorPerformance[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchDoctorPerformance();
  }, [period]);

  // Removed - we now set selectedDoctorInfo directly when clicking

  const fetchDoctorPerformance = async () => {
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

      // Fetch top doctors leaderboard
      const response = await fetch(`${baseUrl}/api/admin-analytics/doctor-leaderboard?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctor performance data');
      }

      const data = await response.json();
      setTopDoctors(data.data || getMockLeaderboard());
    } catch (err: any) {
      console.error('Failed to fetch doctor performance:', err);
      // Use mock data as fallback
      setTopDoctors(getMockLeaderboard());
    } finally {
      setLoading(false);
    }
  };

  const getMockLeaderboard = (): DoctorPerformance[] => {
    return [
      {
        id: 'dr1',
        username: 'dr.rifa.hassan',
        specialty: 'Cardiology',
        portfolioScore: 95,
        treatmentSuccessRate: 92,
        totalPatients: 234,
        totalPosts: 156,
        totalComments: 423,
        conversionRate: 78,
        responseTime: 2.5,
        rating: 4.9,
        rank: 1
      },
      {
        id: 'dr2',
        username: 'dr.mitchell',
        specialty: 'Neurology',
        portfolioScore: 91,
        treatmentSuccessRate: 88,
        totalPatients: 198,
        totalPosts: 142,
        totalComments: 389,
        conversionRate: 74,
        responseTime: 3.2,
        rating: 4.8,
        rank: 2
      },
      {
        id: 'dr3',
        username: 'arjun_mehta',
        specialty: 'Orthopedics',
        portfolioScore: 88,
        treatmentSuccessRate: 85,
        totalPatients: 176,
        totalPosts: 128,
        totalComments: 356,
        conversionRate: 71,
        responseTime: 3.8,
        rating: 4.7,
        rank: 3
      },
      {
        id: 'dr4',
        username: 'priya_nair',
        specialty: 'Dermatology',
        portfolioScore: 86,
        treatmentSuccessRate: 83,
        totalPatients: 165,
        totalPosts: 119,
        totalComments: 334,
        conversionRate: 69,
        responseTime: 4.1,
        rating: 4.6,
        rank: 4
      },
      {
        id: 'dr5',
        username: 'rohan_sharma',
        specialty: 'Pediatrics',
        portfolioScore: 84,
        treatmentSuccessRate: 81,
        totalPatients: 152,
        totalPosts: 108,
        totalComments: 312,
        conversionRate: 67,
        responseTime: 4.5,
        rating: 4.6,
        rank: 5
      }
    ];
  };

  const getAllMockDoctors = (): DoctorPerformance[] => {
    // Extended list of all doctors for search
    return [
      ...getMockLeaderboard(),
      {
        id: 'dr6',
        username: 'sarah_johnson',
        specialty: 'Psychiatry',
        portfolioScore: 82,
        treatmentSuccessRate: 79,
        totalPatients: 143,
        totalPosts: 98,
        totalComments: 289,
        conversionRate: 65,
        responseTime: 4.8,
        rating: 4.5,
        rank: 6
      },
      {
        id: 'dr7',
        username: 'michael_chen',
        specialty: 'Oncology',
        portfolioScore: 80,
        treatmentSuccessRate: 77,
        totalPatients: 134,
        totalPosts: 89,
        totalComments: 267,
        conversionRate: 63,
        responseTime: 5.1,
        rating: 4.5,
        rank: 7
      },
      {
        id: 'dr8',
        username: 'emily_davis',
        specialty: 'Endocrinology',
        portfolioScore: 78,
        treatmentSuccessRate: 75,
        totalPatients: 126,
        totalPosts: 82,
        totalComments: 245,
        conversionRate: 61,
        responseTime: 5.4,
        rating: 4.4,
        rank: 8
      },
      {
        id: 'dr9',
        username: 'david_wilson',
        specialty: 'Gastroenterology',
        portfolioScore: 76,
        treatmentSuccessRate: 73,
        totalPatients: 118,
        totalPosts: 76,
        totalComments: 223,
        conversionRate: 59,
        responseTime: 5.7,
        rating: 4.4,
        rank: 9
      },
      {
        id: 'dr10',
        username: 'lisa_anderson',
        specialty: 'Rheumatology',
        portfolioScore: 74,
        treatmentSuccessRate: 71,
        totalPatients: 109,
        totalPosts: 69,
        totalComments: 201,
        conversionRate: 57,
        responseTime: 6.0,
        rating: 4.3,
        rank: 10
      }
    ];
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        // Use mock data for search
        const allDoctors = getAllMockDoctors();
        const filtered = allDoctors.filter(doctor => 
          doctor.username.toLowerCase().includes(query.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        return;
      }

      // Try to fetch from API
      const response = await fetch(`${baseUrl}/api/admin-analytics/search-doctors?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      } else {
        // Fallback to mock search
        const allDoctors = getAllMockDoctors();
        const filtered = allDoctors.filter(doctor => 
          doctor.username.toLowerCase().includes(query.toLowerCase()) ||
          doctor.specialty.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Fallback to mock search
      const allDoctors = getAllMockDoctors();
      const filtered = allDoctors.filter(doctor => 
        doctor.username.toLowerCase().includes(query.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
    return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="ambient-orb-bottom" />
        <div className="dashboard-content p-6">
          <h1 className="dashboard-title mb-6">Doctor Performance Analytics</h1>
          <div className="grid grid-cols-1 gap-6">
            <ChartSkeleton height={400} />
            <ChartSkeleton height={600} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="ambient-orb-bottom" />
      <div className="dashboard-content p-6">
        {/* Header */}
        <div className="dashboard-header mb-6">
          <div>
            <h1 className="dashboard-title">Doctor Performance Analytics</h1>
            <p className="text-sm" style={{ color: '#8899b4' }}>
              Track doctor performance, portfolio scores, and identify top performers
            </p>
          </div>
          
          {/* Period Selector */}
          <div className="filter-group">
            {['7days', '30days', '90days', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`filter-pill ${period === p ? 'active' : ''}`}
              >
                {p === '7days' ? 'Last 7 Days' : p === '30days' ? 'Last 30 Days' : p === '90days' ? 'Last 90 Days' : 'All Time'}
              </button>
            ))}
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(102, 154, 227, 0.1)' }}>
                <Trophy className="w-5 h-5" style={{ color: '#669ae3' }} />
              </div>
              <span className="text-sm" style={{ color: '#8899b4' }}>Top Doctor</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#e8eef5' }}>
              {topDoctors[0]?.username || 'N/A'}
            </div>
            <div className="text-sm mt-1" style={{ color: '#669ae3' }}>
              Score: {topDoctors[0]?.portfolioScore || 0}/100
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(30, 203, 107, 0.1)' }}>
                <TrendingUp className="w-5 h-5" style={{ color: '#1ecb6b' }} />
              </div>
              <span className="text-sm" style={{ color: '#8899b4' }}>Avg Success Rate</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#e8eef5' }}>
              {topDoctors.length > 0 
                ? Math.round(topDoctors.reduce((sum, d) => sum + d.treatmentSuccessRate, 0) / topDoctors.length)
                : 0}%
            </div>
            <div className="text-sm mt-1" style={{ color: '#1ecb6b' }}>
              Treatment outcomes
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(245, 166, 35, 0.1)' }}>
                <Users className="w-5 h-5" style={{ color: '#f5a623' }} />
              </div>
              <span className="text-sm" style={{ color: '#8899b4' }}>Total Patients</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#e8eef5' }}>
              {topDoctors.reduce((sum, d) => sum + d.totalPatients, 0)}
            </div>
            <div className="text-sm mt-1" style={{ color: '#f5a623' }}>
              Across all doctors
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(138, 99, 210, 0.1)' }}>
                <Activity className="w-5 h-5" style={{ color: '#8a63d2' }} />
              </div>
              <span className="text-sm" style={{ color: '#8899b4' }}>Active Doctors</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: '#e8eef5' }}>
              {topDoctors.length}
            </div>
            <div className="text-sm mt-1" style={{ color: '#8a63d2' }}>
              With performance data
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-6 h-6" style={{ color: '#669ae3' }} />
            <h2 className="text-xl font-bold" style={{ color: '#e8eef5' }}>Search All Doctors</h2>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by doctor name or specialty..."
              className="w-full px-4 py-3 pl-12 rounded-xl border border-white/20 bg-white/5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#8899b4' }} />
          </div>

          {/* Search Results */}
          {isSearching && searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm" style={{ color: '#8899b4' }}>
                Found {searchResults.length} doctor{searchResults.length !== 1 ? 's' : ''}
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {searchResults.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => {
                      // Set both states immediately
                      setSelectedDoctorInfo(doctor);
                      setSelectedDoctor(doctor.id);
                      // Clear search
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearching(false);
                      // Scroll to graphs section
                      setTimeout(() => {
                        const graphsSection = document.getElementById('doctor-graphs-section');
                        if (graphsSection) {
                          graphsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    className="p-3 rounded-lg cursor-pointer transition-all bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold" style={{ color: '#e8eef5' }}>
                            {doctor.username}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full text-xs" style={{ 
                            background: 'rgba(102, 154, 227, 0.1)',
                            color: '#669ae3'
                          }}>
                            {doctor.specialty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1" style={{ color: '#8899b4' }}>
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" style={{ color: '#f5a623' }} />
                            {doctor.rating}
                          </span>
                          <span>{doctor.totalPatients} patients</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xl font-bold ${getScoreColor(doctor.portfolioScore)}`}>
                          {doctor.portfolioScore}
                        </div>
                        <div className="text-xs" style={{ color: '#8899b4' }}>Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isSearching && searchResults.length === 0 && searchQuery.trim() && (
            <div className="mt-4 text-center py-8">
              <p className="text-sm" style={{ color: '#8899b4' }}>
                No doctors found matching "{searchQuery}"
              </p>
            </div>
          )}
        </div>

        {/* Leaderboard */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-6 h-6" style={{ color: '#669ae3' }} />
            <h2 className="text-xl font-bold" style={{ color: '#e8eef5' }}>Top Performing Doctors</h2>
          </div>

          <div className="space-y-3">
            {topDoctors.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => {
                  setSelectedDoctorInfo(doctor);
                  setSelectedDoctor(doctor.id);
                  // Scroll to graphs section
                  setTimeout(() => {
                    const graphsSection = document.getElementById('doctor-graphs-section');
                    if (graphsSection) {
                      graphsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }, 100);
                }}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedDoctor === doctor.id
                    ? 'bg-white/10 border-2 border-blue-500/50'
                    : 'bg-white/5 border border-white/10 hover:bg-white/8'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(doctor.rank)}`}>
                    #{doctor.rank}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg" style={{ color: '#e8eef5' }}>
                        {doctor.username}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                        background: 'rgba(102, 154, 227, 0.1)',
                        color: '#669ae3'
                      }}>
                        {doctor.specialty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm" style={{ color: '#8899b4' }}>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" style={{ color: '#f5a623' }} />
                        {doctor.rating}
                      </span>
                      <span>{doctor.totalPatients} patients</span>
                      <span>{doctor.conversionRate}% conversion</span>
                      <span>{doctor.responseTime}h response time</span>
                    </div>
                  </div>

                  {/* Portfolio Score */}
                  <div className="text-right">
                    <div className="text-sm mb-1" style={{ color: '#8899b4' }}>Portfolio Score</div>
                    <div className={`text-3xl font-bold ${getScoreColor(doctor.portfolioScore)}`}>
                      {doctor.portfolioScore}
                    </div>
                    <div className="text-xs" style={{ color: '#8899b4' }}>out of 100</div>
                  </div>

                  {/* Success Rate */}
                  <div className="text-right">
                    <div className="text-sm mb-1" style={{ color: '#8899b4' }}>Success Rate</div>
                    <div className="text-3xl font-bold" style={{ color: '#1ecb6b' }}>
                      {doctor.treatmentSuccessRate}%
                    </div>
                    <div className="text-xs" style={{ color: '#8899b4' }}>treatments</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Doctor Analytics */}
        {selectedDoctor && selectedDoctorInfo && (
          <div id="doctor-graphs-section" className="space-y-6">
            {/* Header with Close Button */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6" style={{ color: '#669ae3' }} />
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#e8eef5' }}>
                      {selectedDoctorInfo.username}'s Performance Portfolio
                    </h2>
                    <p className="text-sm" style={{ color: '#8899b4' }}>
                      {selectedDoctorInfo.specialty} • Portfolio Score: {selectedDoctorInfo.portfolioScore}/100
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ color: '#8899b4' }}
                  aria-label="Close portfolio view"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Doctor Stats Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(102, 154, 227, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#669ae3' }}>
                    {selectedDoctorInfo.portfolioScore}
                  </div>
                  <div className="text-xs" style={{ color: '#8899b4' }}>Portfolio Score</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(30, 203, 107, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#1ecb6b' }}>
                    {selectedDoctorInfo.treatmentSuccessRate}%
                  </div>
                  <div className="text-xs" style={{ color: '#8899b4' }}>Success Rate</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(245, 166, 35, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#f5a623' }}>
                    {selectedDoctorInfo.totalPatients}
                  </div>
                  <div className="text-xs" style={{ color: '#8899b4' }}>Total Patients</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(138, 99, 210, 0.1)' }}>
                  <div className="text-2xl font-bold" style={{ color: '#8a63d2' }}>
                    {selectedDoctorInfo.conversionRate}%
                  </div>
                  <div className="text-xs" style={{ color: '#8899b4' }}>Conversion Rate</div>
                </div>
              </div>
            </div>

            {/* Doctor Profile Graphs Component */}
            <DoctorProfileGraphs doctorId={selectedDoctor} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
}
