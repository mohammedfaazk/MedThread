'use client'

import { useState, useEffect } from 'react';
import { Star, TrendingUp, Award, Clock, CheckCircle, MapPin, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Doctor {
  id: string;
  username: string;
  avatar: string | null;
  specialty: string | null;
  yearsOfExperience: number | null;
  verified: boolean;
  overall_rating: number;
  total_reviews: number;
  rating_overall: number;
  review_count: number;
  response_time_minutes: number;
  consultation_success_rate: number;
  patient_satisfaction_score: number;
  helpful_replies_count: number;
  total_replies_count: number;
  regional_rank?: number;
  regional_score?: number;
}

export default function TopDoctorsLeaderboard() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [risingStars, setRisingStars] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overall' | 'regional' | 'rising' | 'trending'>('overall');
  
  // Filters
  const [regionType, setRegionType] = useState<'overall' | 'city' | 'state' | 'country'>('overall');
  const [regionName, setRegionName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'responseTime' | 'successRate' | 'satisfaction'>('rating');

  useEffect(() => {
    fetchTopDoctors();
  }, [regionType, regionName, specialty, sortBy, activeTab]);

  const fetchTopDoctors = async () => {
    try {
      setLoading(true);

      if (activeTab === 'overall' || activeTab === 'regional') {
        const params: any = { sortBy };
        if (regionType !== 'overall') {
          params.regionType = regionType;
          if (regionName) params.regionName = regionName;
        }
        if (specialty) params.specialty = specialty;

        const response = await axios.get(`${API_URL}/api/doctors/top`, { params });
        if (response.data.success) {
          setDoctors(response.data.data.doctors);
        }
      } else if (activeTab === 'rising') {
        const response = await axios.get(`${API_URL}/api/doctors/rising-stars`);
        if (response.data.success) {
          setRisingStars(response.data.data.doctors);
        }
      } else if (activeTab === 'trending') {
        const response = await axios.get(`${API_URL}/api/doctors/trending`);
        if (response.data.success) {
          setTrending(response.data.data.doctors);
        }
      }
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatResponseTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-900';
    if (rank === 3) return 'bg-orange-400 text-orange-900';
    return 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Top Doctors Leaderboard</h1>
        <p className="text-gray-600">Discover the best healthcare professionals based on ratings, reviews, and performance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overall')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'overall'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Award className="inline w-4 h-4 mr-1" />
          Overall Top Doctors
        </button>
        <button
          onClick={() => setActiveTab('regional')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'regional'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="inline w-4 h-4 mr-1" />
          Regional Rankings
        </button>
        <button
          onClick={() => setActiveTab('rising')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'rising'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="inline w-4 h-4 mr-1" />
          Rising Stars
        </button>
        <button
          onClick={() => setActiveTab('trending')}
          className={`px-4 py-2 font-semibold whitespace-nowrap ${
            activeTab === 'trending'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="inline w-4 h-4 mr-1" />
          Trending This Week
        </button>
      </div>

      {/* Filters */}
      {(activeTab === 'overall' || activeTab === 'regional') && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold mb-3">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {activeTab === 'regional' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Region Type
                  </label>
                  <select
                    value={regionType}
                    onChange={(e) => setRegionType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                  >
                    <option value="overall">Overall</option>
                    <option value="city">City</option>
                    <option value="state">State</option>
                    <option value="country">Country</option>
                  </select>
                </div>
                {regionType !== 'overall' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region Name
                    </label>
                    <input
                      type="text"
                      value={regionName}
                      onChange={(e) => setRegionName(e.target.value)}
                      placeholder="e.g., Mumbai, Maharashtra"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
                    />
                  </div>
                )}
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <input
                type="text"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="e.g., Cardiology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-400"
              >
                <option value="rating">Overall Rating</option>
                <option value="responseTime">Response Time</option>
                <option value="successRate">Success Rate</option>
                <option value="satisfaction">Patient Satisfaction</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Doctor List */}
      <div className="space-y-4">
        {activeTab === 'overall' || activeTab === 'regional' ? (
          doctors.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No doctors found matching your criteria.
            </div>
          ) : (
            doctors.map((doctor, index) => (
              <div key={doctor.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankBadgeColor(index + 1)}`}>
                    {index + 1}
                  </div>

                  {/* Avatar */}
                  {doctor.avatar ? (
                    <img
                      src={doctor.avatar}
                      alt={doctor.username}
                      className="w-16 h-16 rounded-full"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {doctor.username[0].toUpperCase()}
                    </div>
                  )}

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{doctor.username}</h3>
                      {doctor.verified && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">
                      {doctor.specialty}
                      {doctor.yearsOfExperience && ` • ${doctor.yearsOfExperience} years experience`}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <div>
                          <div className="font-semibold">{parseFloat(doctor.rating_overall).toFixed(1)}</div>
                          <div className="text-xs text-gray-500">{doctor.review_count} reviews</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <div className="font-semibold">{formatResponseTime(doctor.response_time_minutes)}</div>
                          <div className="text-xs text-gray-500">Response time</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <div>
                          <div className="font-semibold">{parseFloat(doctor.consultation_success_rate).toFixed(0)}%</div>
                          <div className="text-xs text-gray-500">Success rate</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-500" />
                        <div>
                          <div className="font-semibold">{doctor.helpful_replies_count}</div>
                          <div className="text-xs text-gray-500">Helpful replies</div>
                        </div>
                      </div>
                    </div>

                    {/* Regional Rank */}
                    {doctor.regional_rank && (
                      <div className="mt-3 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        #{doctor.regional_rank} in {regionName || 'region'}
                      </div>
                    )}
                  </div>

                  {/* View Profile Button */}
                  <button
                    onClick={() => window.location.href = `/u/${doctor.username}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )
        ) : activeTab === 'rising' ? (
          risingStars.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No rising stars at the moment.
            </div>
          ) : (
            risingStars.map((doctor, index) => (
              <div key={doctor.id} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>

                  {doctor.avatar ? (
                    <img src={doctor.avatar} alt={doctor.username} className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {doctor.username[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{doctor.username}</h3>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs font-bold">
                        Rising Star
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{doctor.specialty}</p>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <div className="font-semibold">{parseFloat(doctor.current_rating).toFixed(1)} ⭐</div>
                        <div className="text-xs text-gray-500">Current rating</div>
                      </div>
                      <div>
                        <div className="font-semibold">{doctor.account_age_days} days</div>
                        <div className="text-xs text-gray-500">Account age</div>
                      </div>
                      <div>
                        <div className="font-semibold">+{parseFloat(doctor.rating_velocity).toFixed(2)}/week</div>
                        <div className="text-xs text-gray-500">Rating growth</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = `/u/${doctor.username}`}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          trending.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No trending doctors this week.
            </div>
          ) : (
            trending.map((doctor, index) => (
              <div key={doctor.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>

                  {doctor.avatar ? (
                    <img src={doctor.avatar} alt={doctor.username} className="w-16 h-16 rounded-full" />
                  ) : (
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {doctor.username[0].toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-semibold">{doctor.username}</h3>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full text-xs font-bold animate-pulse">
                        Trending
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{doctor.specialty}</p>

                    <div className="grid grid-cols-4 gap-4 mt-3">
                      <div>
                        <div className="font-semibold">{doctor.reply_count_7d}</div>
                        <div className="text-xs text-gray-500">Replies (7d)</div>
                      </div>
                      <div>
                        <div className="font-semibold">{doctor.helpful_count_7d}</div>
                        <div className="text-xs text-gray-500">Helpful (7d)</div>
                      </div>
                      <div>
                        <div className="font-semibold">{doctor.view_count_7d}</div>
                        <div className="text-xs text-gray-500">Views (7d)</div>
                      </div>
                      <div>
                        <div className="font-semibold">{parseFloat(doctor.current_rating).toFixed(1)} ⭐</div>
                        <div className="text-xs text-gray-500">Rating</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => window.location.href = `/u/${doctor.username}`}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
