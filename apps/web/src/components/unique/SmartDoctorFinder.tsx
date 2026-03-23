'use client';

/**
 * 🎯 SMART DOCTOR FINDER
 * 
 * This is a GAME-CHANGER that beats Practo's doctor search.
 * Matches patients with doctors based on PROVEN success rates, not just specialty.
 */

import React, { useState } from 'react';
import { Search, Star, Clock, TrendingUp, Award, MapPin, MessageCircle, Calendar } from 'lucide-react';

interface DoctorMatch {
  doctorId: string;
  matchScore: number;
  doctor: {
    id: string;
    username: string;
    bio: string;
    avatar?: string;
    specialty: string;
    subSpecialty?: string;
    yearsOfExperience: number;
    hospitalAffiliation?: string;
    clinicAddress?: string;
    totalKarma: number;
  };
  reasons: string[];
  specialization?: {
    condition: string;
    successRate: number;
    patientCount: number;
    avgRecoveryDays?: number;
  };
  availability?: string;
  estimatedResponseTime?: number;
}

export default function SmartDoctorFinder() {
  const [symptoms, setSymptoms] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<'URGENT' | 'NORMAL' | 'LOW'>('NORMAL');
  const [matches, setMatches] = useState<DoctorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!symptoms.trim()) {
      alert('Please describe your symptoms');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/v1/unique/find-doctors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          symptoms: symptoms.split(',').map(s => s.trim()),
          condition: condition || undefined,
          location: location || undefined,
          urgency
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.data.matches || []);
      }
    } catch (error) {
      console.error('Error finding doctors:', error);
      alert('Failed to find doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Possible Match';
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          🎯 Smart Doctor Finder
        </h1>
        <p className="text-lg text-gray-600">
          AI-powered matching based on proven success rates, not just specialty
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <div className="space-y-4">
          {/* Symptoms */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe Your Symptoms *
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., fever, headache, body aches (separate with commas)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Condition (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Known Condition (Optional)
            </label>
            <input
              type="text"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="e.g., Diabetes, Hypertension, Migraine"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Location & Urgency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City or Pincode"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Urgency Level
              </label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="LOW">Low - Can wait a few days</option>
                <option value="NORMAL">Normal - Within 1-2 days</option>
                <option value="URGENT">Urgent - Need help today</option>
              </select>
            </div>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Search size={20} />
            <span>{loading ? 'Finding Best Matches...' : 'Find My Perfect Doctor'}</span>
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Analyzing doctors and matching with your needs...</p>
        </div>
      )}

      {!loading && searched && matches.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-900">
            No doctors found matching your criteria. Try adjusting your search parameters.
          </p>
        </div>
      )}

      {!loading && matches.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Top {matches.length} Matches for You
            </h2>
            <span className="text-sm text-gray-600">
              Sorted by match score
            </span>
          </div>

          {matches.map((match, index) => (
            <div
              key={match.doctorId}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
            >
              {/* Match Score Banner */}
              <div className={`px-6 py-3 ${getMatchScoreColor(match.matchScore)} border-b`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {index === 0 && (
                      <Award className="text-yellow-500" size={24} />
                    )}
                    <span className="font-bold text-lg">
                      {match.matchScore}% Match
                    </span>
                    <span className="text-sm opacity-80">
                      • {getMatchScoreLabel(match.matchScore)}
                    </span>
                  </div>
                  {index === 0 && (
                    <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      BEST MATCH
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Doctor Info */}
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {match.doctor.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Dr. {match.doctor.username}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      {match.doctor.specialty}
                      {match.doctor.subSpecialty && ` • ${match.doctor.subSpecialty}`}
                    </p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {match.doctor.yearsOfExperience} years exp.
                      </span>
                      {match.doctor.totalKarma > 0 && (
                        <span className="flex items-center">
                          <Star size={16} className="mr-1 text-yellow-500" />
                          {match.doctor.totalKarma} karma
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Why This Doctor */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <TrendingUp size={18} className="mr-2" />
                    Why This Doctor is Perfect for You:
                  </h4>
                  <ul className="space-y-1">
                    {match.reasons.map((reason, idx) => (
                      <li key={idx} className="text-blue-800 text-sm flex items-start">
                        <span className="mr-2">✓</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Specialization Stats */}
                {match.specialization && (
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {match.specialization.successRate.toFixed(0)}%
                      </div>
                      <div className="text-xs text-green-700">Success Rate</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {match.specialization.patientCount}
                      </div>
                      <div className="text-xs text-purple-700">Patients Treated</div>
                    </div>
                    {match.specialization.avgRecoveryDays && (
                      <div className="bg-blue-50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {match.specialization.avgRecoveryDays}
                        </div>
                        <div className="text-xs text-blue-700">Avg. Recovery Days</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {match.doctor.clinicAddress && (
                    <span className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {match.doctor.clinicAddress}
                    </span>
                  )}
                  {match.estimatedResponseTime && (
                    <span className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      Responds in ~{Math.round(match.estimatedResponseTime)}h
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <MessageCircle size={18} />
                    <span>Message Doctor</span>
                  </button>
                  <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2">
                    <Calendar size={18} />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
