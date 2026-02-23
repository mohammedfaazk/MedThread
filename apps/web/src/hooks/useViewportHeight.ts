'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to get accurate viewport height on mobile devices
 * Handles address bar showing/hiding on mobile browsers
 */
export function useViewportHeight() {
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const updateHeight = () => {
      // Use visualViewport if available (more accurate on mobile)
      const vh = window.visualViewport?.height || window.innerHeight
      setHeight(vh)
      
      // Set CSS custom property for use in styles
      document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`)
    }

    updateHeight()
    
    window.addEventListener('resize', updateHeight)
    window.visualViewport?.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
      window.visualViewport?.removeEventListener('resize', updateHeight)
    }
  }, [])

  return height
}
