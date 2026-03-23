'use client';

import { useState, useEffect } from 'react';
import { Trophy, Target, Users, Calendar, TrendingUp, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  startDate: string;
  endDate: string;
  goals: any;
  rewards: any;
  _count: {
    participants: number;
  };
}

export default function HealthChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [filter, setFilter] = useState({ category: '', difficulty: '', status: 'active' });

  useEffect(() => {
    fetchChallenges();
    fetchMyChallenges();
  }, [filter]);

  const fetchChallenges = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append('category', filter.category);
      if (filter.difficulty) params.append('difficulty', filter.difficulty);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/v1/health-challenges?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyChallenges = async () => {
    try {
      const response = await fetch('/api/v1/health-challenges/my-challenges', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMyChallenges(data);
      }
    } catch (error) {
      console.error('Error fetching my challenges:', error);
    }
  };

  const joinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(`/api/v1/health-challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchChallenges();
        fetchMyChallenges();
      }
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'green';
      case 'medium': return 'yellow';
      case 'hard': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness': return '🏃';
      case 'nutrition': return '🥗';
      case 'mental': return '🧘';
      case 'sleep': return '😴';
      case 'hydration': return '💧';
      default: return '🎯';
    }
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
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="h-12 w-12" />
            <div>
              <h1 className="text-3xl font-bold">Health Challenges</h1>
              <p className="text-blue-100 mt-1">Join challenges, compete with others, and improve your health</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5" />
                <span className="font-semibold">Active Challenges</span>
              </div>
              <p className="text-2xl font-bold">{challenges.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">My Challenges</span>
              </div>
              <p className="text-2xl font-bold">{myChallenges.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Total Points</span>
              </div>
              <p className="text-2xl font-bold">
                {myChallenges.reduce((sum, c) => sum + (c.points || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            All Challenges
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'my'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Challenges ({myChallenges.length})
          </button>
        </div>

        {/* Filters */}
        {activeTab === 'all' && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-4">
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="fitness">Fitness</option>
                <option value="nutrition">Nutrition</option>
                <option value="mental">Mental Health</option>
                <option value="sleep">Sleep</option>
                <option value="hydration">Hydration</option>
              </select>

              <select
                value={filter.difficulty}
                onChange={(e) => setFilter({ ...filter, difficulty: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        )}

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === 'all' ? challenges : myChallenges.map(c => c.challenge)).map((challenge) => {
            const isJoined = myChallenges.some(c => c.challengeId === challenge.id);
            const myProgress = myChallenges.find(c => c.challengeId === challenge.id);
            const difficultyColor = getDifficultyColor(challenge.difficulty);
            
            return (
              <div
                key={challenge.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{getCategoryIcon(challenge.category)}</div>
                    <span className={`px-3 py-1 bg-${difficultyColor}-100 text-${difficultyColor}-700 text-xs font-semibold rounded-full`}>
                      {challenge.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{challenge._count.participants} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(challenge.startDate).toLocaleDateString()} - {new Date(challenge.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {myProgress && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-blue-600">{myProgress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${myProgress.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">{myProgress.points} points earned</span>
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/health-challenges/${challenge.id}`}
                    className={`block w-full text-center px-4 py-2 rounded-lg font-semibold transition-colors ${
                      isJoined
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isJoined ? 'View Progress' : 'Join Challenge'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {(activeTab === 'all' ? challenges : myChallenges).length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No challenges available' : 'No challenges joined yet'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'all'
                ? 'Check back later for new challenges'
                : 'Browse all challenges and join one to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
