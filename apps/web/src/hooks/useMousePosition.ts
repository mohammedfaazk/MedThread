import { useState, useEffect, useRef, RefObject } from 'react'

interface MousePosition {
  x: number
  y: number
}

export function useMousePosition(elementRef: RefObject<HTMLElement>) {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 })
  const rafRef = useRef<number>()

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel previous RAF if it exists
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Use RAF for smooth 60fps updates
      rafRef.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        })
      })
    }

    element.addEventListener('mousemove', handleMouseMove)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [elementRef])

  return mousePosition
}
