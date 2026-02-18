'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Award, Lock, TrendingUp } from 'lucide-react'

interface Badge {
  type: string
  name: string
  description: string
  icon: string
  category: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  points: number
  earnedAt?: string
}

interface BadgeDisplayProps {
  userId: string
  showAll?: boolean
  limit?: number
}

const RARITY_COLORS = {
  COMMON: 'from-gray-400 to-gray-600',
  RARE: 'from-blue-400 to-blue-600',
  EPIC: 'from-purple-400 to-purple-600',
  LEGENDARY: 'from-yellow-400 to-yellow-600'
}

const RARITY_BORDER = {
  COMMON: 'border-gray-400',
  RARE: 'border-blue-400',
  EPIC: 'border-purple-400',
  LEGENDARY: 'border-yellow-400'
}

export default function BadgeDisplay({ userId, showAll = false, limit = 6 }: BadgeDisplayProps) {
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)
  const [showAllBadges, setShowAllBadges] = useState(showAll)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchBadges()
  }, [userId])

  const fetchBadges = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/badges/user/${userId}`)
      setBadges(response.data.data || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (badges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Lock className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No badges earned yet</p>
      </div>
    )
  }

  const displayedBadges = showAllBadges ? badges : badges.slice(0, limit)
  const hasMore = badges.length > limit

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {displayedBadges.map((badge) => (
          <div
            key={badge.type}
            className={`relative group cursor-pointer transition-transform hover:scale-105`}
            title={badge.description}
          >
            <div
              className={`aspect-square rounded-xl bg-gradient-to-br ${RARITY_COLORS[badge.rarity]} p-1 shadow-lg`}
            >
              <div className="w-full h-full bg-white rounded-lg flex flex-col items-center justify-center p-2">
                <span className="text-4xl mb-1">{badge.icon}</span>
                <span className="text-xs font-semibold text-center text-gray-700 line-clamp-2">
                  {badge.name}
                </span>
              </div>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap shadow-xl">
                <div className="font-semibold mb-1">{badge.name}</div>
                <div className="text-gray-300 mb-1">{badge.description}</div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Award className="w-3 h-3" />
                  <span>{badge.points} points</span>
                </div>
                {badge.earnedAt && (
                  <div className="text-gray-400 mt-1">
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </div>
                )}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && !showAllBadges && (
        <button
          onClick={() => setShowAllBadges(true)}
          className="mt-4 w-full py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Show all {badges.length} badges
        </button>
      )}
    </div>
  )
}
