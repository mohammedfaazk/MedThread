'use client'

import { useState, useEffect } from 'react'

interface TypeTextProps {
  text: string
  className?: string
  delay?: number
  speed?: number
}

export function TypeText({ text, className = '', delay = 0, speed = 50 }: TypeTextProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setDisplayedText(text)
      return
    }

    const startTimeout = setTimeout(() => {
      if (currentIndex < text.length) {
        const timeout = setTimeout(() => {
          setDisplayedText((prev) => prev + text[currentIndex])
          setCurrentIndex((prev) => prev + 1)
        }, speed)

        return () => clearTimeout(timeout)
      }
    }, delay)

    return () => clearTimeout(startTimeout)
  }, [currentIndex, text, delay, speed])

  return (
    <span className={className}>
      {displayedText}
      {currentIndex < text.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  )
}
