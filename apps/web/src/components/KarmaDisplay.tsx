'use client'

import { TrendingUp, Award, MessageSquare, FileText } from 'lucide-react'

interface KarmaMilestone {
  level: number
  name: string
  minKarma: number
  maxKarma: number
  badge: string
  color: string
}

interface KarmaDisplayProps {
  postKarma: number
  commentKarma: number
  totalKarma: number
  postCount?: number
  commentCount?: number
  milestone?: KarmaMilestone
  showBreakdown?: boolean
  size?: 'small' | 'medium' | 'large'
}

export function KarmaDisplay({
  postKarma,
  commentKarma,
  totalKarma,
  postCount = 0,
  commentCount = 0,
  milestone,
  showBreakdown = false,
  size = 'medium'
}: KarmaDisplayProps) {
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  const badgeSize = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl'
  }

  return (
    <div className="space-y-3">
      {/* Total Karma with Milestone */}
      <div className="flex items-center gap-3">
        {milestone && (
          <div 
            className={`${badgeSize[size]} flex items-center justify-center w-12 h-12 rounded-full`}
            style={{ backgroundColor: `${milestone.color}20` }}
            title={milestone.name}
          >
            {milestone.badge}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF4500]" />
            <span className={`font-bold text-gray-800 ${sizeClasses[size]}`}>
              {totalKarma.toLocaleString()} Karma
            </span>
          </div>
          {milestone && (
            <p className="text-xs text-gray-500 mt-0.5">{milestone.name}</p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {showBreakdown && (
        <div className="grid grid-cols-2 gap-3">
          {/* Post Karma */}
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase">Posts</span>
            </div>
            <p className="text-lg font-bold text-blue-900">{postKarma.toLocaleString()}</p>
            {postCount > 0 && (
              <p className="text-xs text-blue-600 mt-1">
                {postCount} posts • {(postKarma / postCount).toFixed(1)} avg
              </p>
            )}
          </div>

          {/* Comment Karma */}
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageSquare className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-green-700 uppercase">Comments</span>
            </div>
            <p className="text-lg font-bold text-green-900">{commentKarma.toLocaleString()}</p>
            {commentCount > 0 && (
              <p className="text-xs text-green-600 mt-1">
                {commentCount} comments • {(commentKarma / commentCount).toFixed(1)} avg
              </p>
            )}
          </div>
        </div>
      )}

      {/* Progress to Next Milestone */}
      {milestone && milestone.maxKarma !== Infinity && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600">
            <span>{milestone.name}</span>
            <span>Next: {milestone.maxKarma + 1}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(((totalKarma - milestone.minKarma) / (milestone.maxKarma - milestone.minKarma)) * 100, 100)}%`,
                backgroundColor: milestone.color
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-right">
            {milestone.maxKarma - totalKarma + 1} more to next level
          </p>
        </div>
      )}
    </div>
  )
}
