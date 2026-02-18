'use client'

import { RefreshCw } from 'lucide-react'

interface PullToRefreshIndicatorProps {
  pullDistance: number
  threshold: number
  isRefreshing: boolean
}

export function PullToRefreshIndicator({ 
  pullDistance, 
  threshold, 
  isRefreshing 
}: PullToRefreshIndicatorProps) {
  const progress = Math.min((pullDistance / threshold) * 100, 100)
  const rotation = (pullDistance / threshold) * 360

  if (pullDistance === 0 && !isRefreshing) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
      style={{ 
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
      }}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-full p-3 shadow-lg mt-4">
        <RefreshCw 
          className={`w-6 h-6 text-[#5CB8B2] ${isRefreshing ? 'animate-spin' : ''}`}
          style={{ 
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: 'transform 0.1s ease-out'
          }}
        />
      </div>
    </div>
  )
}
