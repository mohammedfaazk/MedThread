'use client';

import { useState, useEffect } from 'react';
import { Trophy, Plus, Users, Calendar, Target, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface HealthChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  targetMetric: string;
  targetValue: number;
  riskLevel: string;
  requiresDoctorApproval: boolean;
  participantCount: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  isActive: boolean;
}

export default function AdminHealthChallengesPage() {
  const [challenges, setChallenges] = useState<HealthChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('FITNESS');
  const [difficulty, setDifficulty] = useState('BEGINNER');
  const [duration, setDuration] = useState(7);
  const [targetMetric, setTargetMetric] = useState('');
  const [targetValue, setTargetValue] = useState(0);
  const [riskLevel, setRiskLevel] = useState<'LOW' | 'HIGH'>('LOW');

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/v1/health-challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChallenges(response.data.data.challenges || []);
    } catch (error) {
      console.error('Failed to load challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async () => {
    if (!title || !description || !targetMetric || targetValue <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const token = localStorage.getItem('auth_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      await axios.post(
        `${API_URL}/api/v1/health-challenges`,
        {
          title,
          description,
          category,
          difficulty,
          duration,
          targetMetric,
          targetValue,
          riskLevel
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Challenge created successfully!');
      setShowCreateModal(false);
      resetForm();
      loadChallenges();
    } catch (error: any) {
      console.error('Failed to create challenge:', error);
      alert(`Failed to create challenge: ${error.response?.data?.error || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('FITNESS');
    setDifficulty('BEGINNER');
    setDuration(7);
    setTargetMetric('');
    setTargetValue(0);
    setRiskLevel('LOW');
  };

  const getRiskBadge = (riskLevel: string) => {
    return riskLevel === 'HIGH' 
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-green-100 text-green-700 border-green-300';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Challenges Management</h1>
            <p className="text-gray-600">Create and manage health challenges for the community</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Challenge
          </button>
        </div>

        {/* Challenges List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading challenges...</p>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No challenges created yet</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create First Challenge
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {challenges.map((challenge) => (
                  <div key={challenge.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{challenge.title}</h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(challenge.riskLevel)}`}>
                            {challenge.riskLevel} RISK
                          </span>
                          {challenge.requiresDoctorApproval && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              Requires Approval
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Category</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.category}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Difficulty</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.difficulty}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.duration} days</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Participants</p>
                            <p className="text-sm font-semibold text-gray-900">{challenge.participantCount}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            Goal: <strong>{challenge.targetValue} {challenge.targetMetric}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          challenge.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {challenge.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Create Health Challenge</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Risk Level Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Risk Level Guide:</strong>
                    <ul className="mt-2 space-y-1 ml-4 list-disc">
                      <li><strong>LOW RISK:</strong> Walking, hydration, sleep tracking (patients join freely)</li>
                      <li><strong>HIGH RISK:</strong> Diet restrictions, fasting, intense exercise (requires doctor approval)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Challenge Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 30-Day Walking Challenge"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the challenge goals and rules..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="FITNESS">Fitness</option>
                    <option value="NUTRITION">Nutrition</option>
                    <option value="MENTAL_HEALTH">Mental Health</option>
                    <option value="SLEEP">Sleep</option>
                    <option value="HYDRATION">Hydration</option>
                    <option value="WEIGHT_LOSS">Weight Loss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (days)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Metric</label>
                  <input
                    type="text"
                    value={targetMetric}
                    onChange={(e) => setTargetMetric(e.target.value)}
                    placeholder="e.g., steps, glasses of water"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Value</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(parseInt(e.target.value))}
                    min="1"
                    placeholder="e.g., 10000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Risk Level</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as 'LOW' | 'HIGH')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LOW">Low Risk (Patients join freely)</option>
                  <option value="HIGH">High Risk (Requires doctor approval)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {riskLevel === 'LOW' 
                    ? 'Patients can join this challenge immediately without approval'
                    : 'Patients must get doctor approval before joining this challenge'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChallenge}
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  {creating ? 'Creating...' : 'Create Challenge'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
