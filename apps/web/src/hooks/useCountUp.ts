import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  start?: number
  end: number
  duration?: number
  enabled?: boolean
}

export function useCountUp({ start = 0, end, duration = 2000, enabled = true }: UseCountUpOptions) {
  const [count, setCount] = useState(start)

  useEffect(() => {
    if (!enabled) {
      setCount(end)
      return
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setCount(end)
      return
    }

    let startTime: number | null = null
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(start + (end - start) * easeOut)

      setCount(currentCount)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [start, end, duration, enabled])

  return count
}
