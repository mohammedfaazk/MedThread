'use client'

import { useEffect, useRef, useState } from 'react'

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const { onRefresh, threshold = 80, resistance = 2.5 } = options
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) return

      currentY.current = e.touches[0].clientY
      const distance = (currentY.current - startY.current) / resistance

      if (distance > 0) {
        setPullDistance(Math.min(distance, threshold * 1.5))
        if (distance > 10) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      
      setIsPulling(false)
      setPullDistance(0)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, threshold, resistance, onRefresh, isRefreshing])

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    shouldTrigger: pullDistance >= threshold
  }
}
