'use client'

import { useState, useEffect } from 'react'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { KarmaDisplay } from '@/components/KarmaDisplay'
import { getImageUrl } from '@/lib/imageUrl'
import Link from 'next/link'
import axios from 'axios'
import { Trophy, TrendingUp, Stethoscope, Users, Loader2, Crown, Medal, Award } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface LeaderboardUser {
  id: string
  username: string
  avatar?: string
  role: string
  verified: boolean
  specialty?: string
  totalKarma: number
  postKarma: number
  commentKarma: number
  rank: number
  milestone: {
    level: number
    name: string
    badge: string
    color: string
  }
  _count: {
    posts: number
    comments: number
  }
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'doctors'>('all')
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchLeaderboard()
    fetchStats()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const endpoint = activeTab === 'doctors' 
        ? '/api/v1/karma/leaderboard/doctors'
        : '/api/v1/karma/leaderboard'
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        params: { limit: 50 }
      })

      if (response.data.success) {
        const data = activeTab === 'doctors' ? response.data.data.doctors : response.data.data.users
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/karma/stats`)
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />
    return <span className="text-gray-500 font-bold">#{rank}</span>
  }

  return (
    <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        
        <main className="flex-1 max-w-[900px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-2xl p-8 mb-6 text-white shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Trophy className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Karma Leaderboard</h1>
                <p className="text-white/90 mt-1">Top contributors to the MedThread community</p>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/80 text-sm mb-1">Total Karma</p>
                  <p className="text-2xl font-bold">{stats.totalKarma.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/80 text-sm mb-1">Average Karma</p>
                  <p className="text-2xl font-bold">{stats.averageKarma.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/80 text-sm mb-1">Votes (24h)</p>
                  <p className="text-2xl font-bold">{stats.recentVotes24h.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-3 mb-4 flex items-center gap-2 shadow-soft">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'all' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
              }`}
            >
              <Users className="w-4 h-4" />
              All Users
            </button>
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
                activeTab === 'doctors' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Doctors Only
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-soft">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading leaderboard...</p>
            </div>
          )}

          {/* Leaderboard */}
          {!loading && (
            <div className="space-y-3">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  className="block bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 hover:shadow-elevated transition-all shadow-soft"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(user.rank)}
                    </div>

                    {/* Avatar */}
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar) || ''}
                        alt={user.username}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-800">u/{user.username}</h3>
                        {user.verified && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            ✓ Verified
                          </span>
                        )}
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{ 
                            backgroundColor: `${user.milestone.color}20`,
                            color: user.milestone.color
                          }}
                        >
                          {user.milestone.badge} {user.milestone.name}
                        </span>
                      </div>
                      {user.specialty && (
                        <p className="text-sm text-gray-600 mb-2">{user.specialty}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-[#FF4500]" />
                          <span className="font-semibold text-[#FF4500]">{user.totalKarma.toLocaleString()}</span>
                        </span>
                        <span>{user._count.posts} posts</span>
                        <span>{user._count.comments} comments</span>
                      </div>
                    </div>

                    {/* Karma Breakdown */}
                    <div className="hidden lg:flex gap-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Post</p>
                        <p className="text-lg font-bold text-blue-600">{user.postKarma}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Comment</p>
                        <p className="text-lg font-bold text-green-600">{user.commentKarma}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && users.length === 0 && (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center shadow-soft">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Users Yet</h3>
              <p className="text-gray-600">Be the first to earn karma!</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
