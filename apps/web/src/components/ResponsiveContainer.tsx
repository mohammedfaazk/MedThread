'use client'

import { ReactNode } from 'react'

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  mobilePadding?: boolean
}

export function ResponsiveContainer({ 
  children, 
  className = '',
  mobilePadding = true 
}: ResponsiveContainerProps) {
  return (
    <div 
      className={`
        w-full mx-auto
        ${mobilePadding ? 'px-4 sm:px-6 lg:px-8' : ''}
        ${className}
      `}
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)', // Account for mobile nav
      }}
    >
      {children}
    </div>
  )
}
