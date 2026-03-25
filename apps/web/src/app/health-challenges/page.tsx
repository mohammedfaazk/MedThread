'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, Users, Calendar, Award, Plus } from 'lucide-react';
import Link from 'next/link';
import { useJWTAuth } from '@/context/JWTAuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  riskLevel?: string;
  requiresDoctorApproval?: boolean;
  isDoctorApproved?: boolean;
  startDate: string;
  endDate: string;
  goal: number;
  unit: string;
  participantCount: number;
}

export default function HealthChallengesPage() {
  const { user } = useJWTAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const canCreateChallenge = user?.role === 'DOCTOR' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchChallenges();
    fetchMyChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/health-challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setChallenges(data.data.challenges || []);
        } else {
          setChallenges([]);
        }
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/health-challenges/user/my-challenges`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyChallenges(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching my challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/health-challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Successfully joined the challenge!');
        fetchChallenges();
        fetchMyChallenges();
      } else {
        alert(data.error || 'Failed to join challenge');
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert('Failed to join challenge');
    }
  };

  const leaveChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to leave this challenge? Your progress will be lost.')) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/health-challenges/${challengeId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('You have left the challenge');
        fetchChallenges();
        fetchMyChallenges();
      } else {
        alert(data.error || 'Failed to leave challenge');
      }
    } catch (error) {
      console.error('Error leaving challenge:', error);
      alert('Failed to leave challenge');
    }
  };

  const isJoined = (challengeId: string) => {
    return myChallenges.some(c => c.id === challengeId);
  };

  const approveChallenge = async (challengeId: string) => {
    setApprovingId(challengeId);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/v1/health-challenges/${challengeId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert('Challenge approved! Patients can now join this challenge.');
        fetchChallenges();
      } else {
        alert(data.error || 'Failed to approve challenge');
      }
    } catch (error) {
      console.error('Error approving challenge:', error);
      alert('Failed to approve challenge');
    } finally {
      setApprovingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return '🏃';
      case 'nutrition': return '🥗';
      case 'mental_health': return '🧘';
      case 'sleep': return '😴';
      case 'hydration': return '💧';
      default: return '🎯';
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    return riskLevel === 'HIGH' 
      ? 'bg-red-100 text-red-700 border-red-300'
      : 'bg-green-100 text-green-700 border-green-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Trophy className="h-12 w-12" />
              <div>
                <h1 className="text-3xl font-bold">Health Challenges</h1>
                <p className="text-blue-100 mt-1">Join challenges, compete with others, and improve your health</p>
              </div>
            </div>
            {canCreateChallenge && (
              <Link
                href="/admin/health-challenges"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Challenge
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{challenges.length}</div>
              <div className="text-blue-100 text-sm">Active Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{myChallenges.length}</div>
              <div className="text-blue-100 text-sm">My Challenges</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {challenges.reduce((sum, c) => sum + (c.participantCount || 0), 0)}
              </div>
              <div className="text-blue-100 text-sm">Total Participants</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            My Challenges
          </button>
        </div>

        {/* Challenges Grid */}
        {activeTab === 'all' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{getCategoryIcon(challenge.category)}</div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${getDifficultyColor(challenge.difficulty)}-100 text-${getDifficultyColor(challenge.difficulty)}-700`}>
                      {challenge.difficulty}
                    </span>
                    {challenge.riskLevel && (
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRiskBadge(challenge.riskLevel)}`}>
                        {challenge.riskLevel}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    <span>Goal: <strong>{challenge.goal} {challenge.unit}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span><strong>{challenge.participantCount || 0}</strong> participants</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Show approval status for HIGH-RISK challenges */}
                {challenge.riskLevel === 'HIGH' && challenge.isDoctorApproved && (
                  <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-semibold text-center">
                    ✓ Doctor Approved
                  </div>
                )}

                {/* Buttons based on user role */}
                {canCreateChallenge ? (
                  // Doctors see approve button for unapproved HIGH-RISK challenges
                  challenge.riskLevel === 'HIGH' && !challenge.isDoctorApproved ? (
                    <button
                      onClick={() => approveChallenge(challenge.id)}
                      disabled={approvingId === challenge.id}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {approvingId === challenge.id ? 'Approving...' : 'Approve Challenge'}
                    </button>
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-semibold">
                      {challenge.isDoctorApproved ? '✓ Approved' : '✓ Low Risk'}
                    </div>
                  )
                ) : (
                  // Patients see join/leave button based on participation status
                  isJoined(challenge.id) ? (
                    <button
                      onClick={() => leaveChallenge(challenge.id)}
                      className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                    >
                      Leave Challenge
                    </button>
                  ) : challenge.riskLevel === 'HIGH' && !challenge.isDoctorApproved ? (
                    <button
                      disabled
                      className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-semibold"
                      title="This challenge requires doctor approval"
                    >
                      Awaiting Doctor Approval
                    </button>
                  ) : (
                    <button
                      onClick={() => joinChallenge(challenge.id)}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                      Join Challenge
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myChallenges.length === 0 ? (
              <div className="col-span-full text-center py-12 bg-white rounded-xl">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">You haven't joined any challenges yet</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Challenges
                </button>
              </div>
            ) : (
              myChallenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.title}</h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-blue-600">{challenge.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${challenge.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Award className="w-4 h-4" />
                    <span><strong>{challenge.points || 0}</strong> points earned</span>
                  </div>
                  <Link
                    href={`/health-challenges/${challenge.id}`}
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
