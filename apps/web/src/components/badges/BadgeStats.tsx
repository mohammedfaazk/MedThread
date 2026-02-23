'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Award, TrendingUp, Star } from 'lucide-react'

interface BadgeStats {
  totalBadges: number
  totalPoints: number
  byCategory: Record<string, number>
  byRarity: Record<string, number>
  recentBadges: Array<{
    name: string
    icon: string
    earnedAt: string
  }>
}

interface BadgeStatsProps {
  userId: string
}

export default function BadgeStats({ userId }: BadgeStatsProps) {
  const [stats, setStats] = useState<BadgeStats | null>(null)
  const [loading, setLoading] = useState(true)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchStats()
  }, [userId])

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/badges/user/${userId}/stats`)
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching badge stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-blue-700 font-medium">Total Badges</span>
          </div>
          <p className="text-3xl font-bold text-blue-900">{stats.totalBadges}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-700 font-medium">Badge Points</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{stats.totalPoints}</p>
        </div>
      </div>

      {/* Recent Badges */}
      {stats.recentBadges.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Recent Achievements</span>
          </div>
          <div className="space-y-2">
            {stats.recentBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <span className="text-2xl">{badge.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">By Category</h4>
          <div className="space-y-2">
            {Object.entries(stats.byCategory).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {category.toLowerCase().replace('_', ' ')}
                </span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rarity Breakdown */}
      {Object.keys(stats.byRarity).length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">By Rarity</h4>
          <div className="space-y-2">
            {Object.entries(stats.byRarity).map(([rarity, count]) => (
              <div key={rarity} className="flex items-center justify-between">
                <span className={`text-sm font-medium ${
                  rarity === 'LEGENDARY' ? 'text-yellow-600' :
                  rarity === 'EPIC' ? 'text-purple-600' :
                  rarity === 'RARE' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  {rarity}
                </span>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
