'use client'

import { useCallback } from 'react'

/**
 * Hook to provide haptic feedback on touch devices
 */
export function useTouchFeedback() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const lightTap = useCallback(() => vibrate(10), [vibrate])
  const mediumTap = useCallback(() => vibrate(20), [vibrate])
  const heavyTap = useCallback(() => vibrate(30), [vibrate])
  const doubleTap = useCallback(() => vibrate([10, 50, 10]), [vibrate])
  const success = useCallback(() => vibrate([10, 100, 10]), [vibrate])
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate])

  return {
    vibrate,
    lightTap,
    mediumTap,
    heavyTap,
    doubleTap,
    success,
    error
  }
}
