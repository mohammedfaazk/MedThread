'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { Trophy, Lock, Star, Zap, Award, TrendingUp, Loader2, Filter } from 'lucide-react'
import axios from 'axios'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Badge {
  type: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  points: number
}

interface UserBadge {
  id: string
  badgeType: string
  earnedAt: string
  badge: Badge
}

interface BadgeStats {
  totalBadges: number
  totalPoints: number
  badgesByCategory: Record<string, number>
  badgesByRarity: Record<string, number>
}

const RARITY_COLORS = {
  COMMON: 'from-gray-400 to-gray-500',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-orange-500'
}

const RARITY_TEXT_COLORS = {
  COMMON: 'text-gray-600',
  RARE: 'text-blue-600',
  EPIC: 'text-purple-600',
  LEGENDARY: 'text-yellow-600'
}

const CATEGORY_ICONS: Record<string, any> = {
  APPOINTMENT: '📅',
  CONSULTATION: '🩺',
  SOCIAL: '👥',
  VERIFICATION: '✅',
  ENGAGEMENT: '💬',
  STREAK: '🔥'
}

export default function BadgesPage() {
  const { user } = useJWTAuth()
  const router = useRouter()
  const [allBadges, setAllBadges] = useState<Badge[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [stats, setStats] = useState<BadgeStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL')

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      if (!token) {
        router.push('/login')
        return
      }

      // Fetch all badges, user badges, and stats in parallel
      const [allBadgesRes, userBadgesRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/badges`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/badges/me`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_URL}/api/badges/me/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (allBadgesRes.data.success) {
        setAllBadges(allBadgesRes.data.data)
      }

      if (userBadgesRes.data.success) {
        setUserBadges(userBadgesRes.data.data)
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasBadge = (badgeType: string) => {
    return userBadges.some(ub => ub.badgeType === badgeType)
  }

  const getBadgeEarnedDate = (badgeType: string) => {
    const userBadge = userBadges.find(ub => ub.badgeType === badgeType)
    return userBadge ? new Date(userBadge.earnedAt).toLocaleDateString() : null
  }

  const filteredBadges = allBadges.filter(badge => {
    if (selectedCategory !== 'ALL' && badge.category !== selectedCategory) {
      return false
    }
    if (selectedRarity !== 'ALL' && badge.rarity !== selectedRarity) {
      return false
    }
    return true
  })

  const categories = ['ALL', ...Array.from(new Set(allBadges.map(b => b.category)))]
  const rarities = ['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY']

  if (!user) {
    return null
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <NavbarEnhanced />
        <div className="flex max-w-[1400px] mx-auto">
          <Sidebar />
          <div className="flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Badges & Achievements</h1>
                <p className="text-gray-600">
                  Earn badges by being active on MedThread
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Award className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Badges</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalBadges}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Points</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalPoints}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Completion</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {Math.round((stats.totalBadges / allBadges.length) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rank</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalBadges >= 20 ? 'Expert' : stats.totalBadges >= 10 ? 'Advanced' : 'Beginner'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Filters */}
              <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-4 mb-6 shadow-sm">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'ALL' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>

                  {/* Rarity Filter */}
                  <select
                    value={selectedRarity}
                    onChange={(e) => setSelectedRarity(e.target.value)}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    {rarities.map(rarity => (
                      <option key={rarity} value={rarity}>
                        {rarity === 'ALL' ? 'All Rarities' : rarity}
                      </option>
                    ))}
                  </select>

                  <div className="ml-auto text-sm text-gray-600">
                    Showing {filteredBadges.length} of {allBadges.length} badges
                  </div>
                </div>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBadges.map((badge) => {
                  const earned = hasBadge(badge.type)
                  const earnedDate = getBadgeEarnedDate(badge.type)

                  return (
                    <div
                      key={badge.type}
                      className={`bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm transition-all ${
                        earned ? 'ring-2 ring-blue-400 ring-opacity-50' : 'opacity-60'
                      }`}
                    >
                      {/* Badge Icon */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                          {earned ? badge.icon : <Lock className="w-8 h-8 text-white" />}
                        </div>
                        {earned && (
                          <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            EARNED
                          </div>
                        )}
                      </div>

                      {/* Badge Info */}
                      <div className="mb-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {badge.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {badge.description}
                        </p>
                      </div>

                      {/* Badge Meta */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{CATEGORY_ICONS[badge.category]}</span>
                          <span className="text-xs text-gray-500">{badge.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold ${RARITY_TEXT_COLORS[badge.rarity]}`}>
                            {badge.rarity}
                          </span>
                          <span className="text-xs font-bold text-yellow-600">
                            {badge.points} pts
                          </span>
                        </div>
                      </div>

                      {/* Earned Date */}
                      {earned && earnedDate && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Earned on {earnedDate}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {filteredBadges.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No badges found with current filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </IridescenceLayout>
  )
}
