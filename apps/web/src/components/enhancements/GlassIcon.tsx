'use client'

import { LucideIcon } from 'lucide-react'
import React from 'react'

interface GlassIconProps {
  icon: LucideIcon
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'cyan' | 'red' | 'indigo'
  className?: string
  size?: number
  label?: string
  enhanced?: boolean // Toggle for 3D glass effect
}

// Gradient mappings for 3D glass effect
const gradientMapping: Record<string, string> = {
  blue: 'linear-gradient(135deg, hsl(223, 90%, 50%), hsl(208, 90%, 50%))',
  purple: 'linear-gradient(135deg, hsl(283, 90%, 50%), hsl(268, 90%, 50%))',
  red: 'linear-gradient(135deg, hsl(3, 90%, 50%), hsl(348, 90%, 50%))',
  indigo: 'linear-gradient(135deg, hsl(253, 90%, 50%), hsl(238, 90%, 50%))',
  orange: 'linear-gradient(135deg, hsl(43, 90%, 50%), hsl(28, 90%, 50%))',
  green: 'linear-gradient(135deg, hsl(123, 90%, 40%), hsl(108, 90%, 40%))',
  cyan: 'linear-gradient(135deg, hsl(193, 90%, 50%), hsl(178, 90%, 50%))',
}

// Simple color styles for non-enhanced mode
const colorStyles = {
  blue: 'bg-blue-100/40 border-blue-200/30 text-blue-600',
  green: 'bg-green-100/40 border-green-200/30 text-green-600',
  orange: 'bg-orange-100/40 border-orange-200/30 text-orange-600',
  purple: 'bg-purple-100/40 border-purple-200/30 text-purple-600',
  cyan: 'bg-cyan-100/40 border-cyan-200/30 text-cyan-600',
  red: 'bg-red-100/40 border-red-200/30 text-red-600',
  indigo: 'bg-indigo-100/40 border-indigo-200/30 text-indigo-600',
}

export function GlassIcon({ 
  icon: Icon, 
  color = 'green', 
  className = '', 
  size = 40,
  label,
  enhanced = true // Default to enhanced 3D effect
}: GlassIconProps) {
  const colorClass = colorStyles[color]
  
  // Enhanced 3D glass effect
  if (enhanced) {
    const getBackgroundStyle = (color: string): React.CSSProperties => {
      if (gradientMapping[color]) {
        return { background: gradientMapping[color] }
      }
      return { background: color }
    }

    return (
      <button
        type="button"
        aria-label={label || 'Icon'}
        className="relative bg-transparent outline-none border-none cursor-pointer w-[4.5em] h-[4.5em] [perspective:24em] [transform-style:preserve-3d] [-webkit-tap-highlight-color:transparent] group scale-[0.65] origin-center"
      >
        {/* Colored shadow layer */}
        <span
          className="absolute top-0 left-0 w-full h-full rounded-[1.25em] block transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[100%_100%] rotate-[15deg] [will-change:transform] group-hover:[transform:rotate(25deg)_translate3d(-0.5em,-0.5em,0.5em)]"
          style={{
            ...getBackgroundStyle(color),
            boxShadow: '0.5em -0.5em 0.75em hsla(223, 10%, 10%, 0.15)'
          }}
        />
        
        {/* Glass layer with icon */}
        <span
          className="absolute top-0 left-0 w-full h-full rounded-[1.25em] bg-[hsla(0,0%,100%,0.15)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] origin-[80%_50%] flex backdrop-blur-[0.75em] [-webkit-backdrop-filter:blur(0.75em)] [-moz-backdrop-filter:blur(0.75em)] [will-change:transform] transform group-hover:[transform:translate3d(0,0,2em)]"
          style={{
            boxShadow: '0 0 0 0.1em hsla(0, 0%, 100%, 0.3) inset'
          }}
        >
          <span className="m-auto w-[1.5em] h-[1.5em] flex items-center justify-center" aria-hidden="true">
            <Icon className={className} size={size} />
          </span>
        </span>
        
        {/* Label on hover */}
        {label && (
          <span className="absolute top-full left-0 right-0 text-center whitespace-nowrap leading-[2] text-xs opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.83,0,0.17,1)] translate-y-0 group-hover:opacity-100 group-hover:[transform:translateY(20%)] text-gray-700 font-medium">
            {label}
          </span>
        )}
      </button>
    )
  }
  
  // Simple glass effect (backward compatible)
  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Glass background with color */}
      <div className={`absolute inset-0 backdrop-blur-md rounded-lg border shadow-sm transition-all hover:scale-105 ${colorClass}`} />
      
      {/* Icon */}
      <div className="relative p-2.5">
        <Icon className={className} size={size} />
      </div>
    </div>
  )
}
