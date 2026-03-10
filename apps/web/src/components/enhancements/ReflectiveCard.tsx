'use client'

import { useRef, useState } from 'react'
import { useMousePosition } from '@/hooks/useMousePosition'

interface ReflectiveCardProps {
  children: React.ReactNode
  className?: string
}

export function ReflectiveCard({ children, className = '' }: ReflectiveCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const mousePosition = useMousePosition(cardRef)

  return (
    <div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Reflective gradient overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.15), transparent 40%)`,
            mixBlendMode: 'overlay',
          }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
