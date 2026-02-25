'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface MatchResult {
  doctor: {
    id: string;
    username: string;
    avatar?: string;
    specialty: string;
    subSpecialty?: string;
    yearsOfExperience: number;
    hospitalAffiliation?: string;
    overall_rating: number;
    total_reviews: number;
  };
  matchScore: number;
  scores: {
    specialty: number;
    location: number;
    availability: number;
    rating: number;
    language: number;
    insurance: number;
    experience: number;
  };
  distance?: number;
  matchReason: string;
  estimatedWaitTime?: number;
}

export default function SmartDoctorMatcher() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [maxDistance, setMaxDistance] = useState(50);
  const [minRating, setMinRating] = useState(4.0);
  const [consultationType, setConsultationType] = useState<'video' | 'in_person' | 'any'>('any');
  const [preferredGender, setPreferredGender] = useState<'male' | 'female' | 'any'>('any');
  
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setUseLocation(true);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Could not get your location');
        }
      );
    }
  };

  // Add symptom
  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  // Remove symptom
  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  // Find matches
  const findMatches = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/matching/find', {
        symptoms,
        location: useLocation ? location : null,
        preferredLanguage: preferredLanguage || null,
        insuranceProvider: insuranceProvider || null,
        maxDistance,
        minRating,
        consultationType,
        preferredGender,
        limit: 10
      });

      if (response.data.success) {
        setMatches(response.data.data.matches);
      } else {
        setError(response.data.error || 'Failed to find matches');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to find matching doctors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Find Your Best Match Doctor</h2>
        
        {/* Symptoms Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            What symptoms are you experiencing?
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
              placeholder="e.g., headache, fever, cough"
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addSymptom}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          
          {/* Symptom Tags */}
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <span
                key={symptom}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
              >
                {symptom}
                <button
                  onClick={() => removeSymptom(symptom)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useLocation}
              onChange={(e) => {
                if (e.target.checked) {
                  getUserLocation();
                } else {
                  setUseLocation(false);
                  setLocation(null);
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium">
              Use my location to find nearby doctors
            </span>
          </label>
          {useLocation && location && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Location enabled
            </p>
          )}
        </div>

        {/* Advanced Filters */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-800 text-sm mb-4"
        >
          {showAdvanced ? '− Hide' : '+ Show'} Advanced Filters
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Language
              </label>
              <input
                type="text"
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                placeholder="e.g., en, es, hi"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Insurance Provider
              </label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g., Blue Cross"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Distance (km)
              </label>
              <input
                type="number"
                value={maxDistance}
                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="3.0">3.0+</option>
                <option value="3.5">3.5+</option>
                <option value="4.0">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Consultation Type
              </label>
              <select
                value={consultationType}
                onChange={(e) => setConsultationType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="any">Any</option>
                <option value="video">Video Only</option>
                <option value="in_person">In-Person Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Gender
              </label>
              <select
                value={preferredGender}
                onChange={(e) => setPreferredGender(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="any">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        )}

        {/* Find Matches Button */}
        <button
          onClick={findMatches}
          disabled={loading || symptoms.length === 0}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Finding Best Matches...' : 'Find Matching Doctors'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Match Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">
            Top {matches.length} Matching Doctors
          </h3>

          {matches.map((match, index) => (
            <div
              key={match.doctor.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Rank Badge */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' :
                    'bg-blue-600'
                  }`}>
                    #{index + 1}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-bold">
                        Dr. {match.doctor.username}
                      </h4>
                      <p className="text-gray-600">
                        {match.doctor.specialty}
                        {match.doctor.subSpecialty && ` • ${match.doctor.subSpecialty}`}
                      </p>
                      {match.doctor.hospitalAffiliation && (
                        <p className="text-sm text-gray-500">
                          {match.doctor.hospitalAffiliation}
                        </p>
                      )}
                    </div>

                    {/* Match Score */}
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {match.matchScore.toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-500">Match Score</div>
                    </div>
                  </div>

                  {/* Match Reason */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">Why this match: </span>
                      {match.matchReason}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">
                        {match.doctor.overall_rating.toFixed(1)} ⭐
                      </div>
                      <div className="text-xs text-gray-600">
                        {match.doctor.total_reviews} reviews
                      </div>
                    </div>

                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {match.doctor.yearsOfExperience}y
                      </div>
                      <div className="text-xs text-gray-600">Experience</div>
                    </div>

                    {match.distance && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {match.distance.toFixed(1)}km
                        </div>
                        <div className="text-xs text-gray-600">Distance</div>
                      </div>
                    )}

                    {match.estimatedWaitTime !== undefined && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold text-purple-600">
                          {match.estimatedWaitTime < 60
                            ? `${match.estimatedWaitTime}m`
                            : `${Math.round(match.estimatedWaitTime / 60)}h`}
                        </div>
                        <div className="text-xs text-gray-600">Wait Time</div>
                      </div>
                    )}
                  </div>

                  {/* Score Breakdown */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-700 mb-1">
                      Match Breakdown:
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Specialty</span>
                          <span className="font-medium">{match.scores.specialty.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-blue-600 rounded"
                            style={{ width: `${match.scores.specialty}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Location</span>
                          <span className="font-medium">{match.scores.location.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-green-600 rounded"
                            style={{ width: `${match.scores.location}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Available</span>
                          <span className="font-medium">{match.scores.availability.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-purple-600 rounded"
                            style={{ width: `${match.scores.availability}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span>Rating</span>
                          <span className="font-medium">{match.scores.rating.toFixed(0)}%</span>
                        </div>
                        <div className="h-1 bg-gray-200 rounded">
                          <div
                            className="h-1 bg-yellow-600 rounded"
                            style={{ width: `${match.scores.rating}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                      Book Appointment
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {matches.length === 0 && !loading && symptoms.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600">
            Click "Find Matching Doctors" to see your best matches
          </p>
        </div>
      )}
    </div>
  );
}
