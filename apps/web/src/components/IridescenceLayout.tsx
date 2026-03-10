'use client'

import { useMemo, memo, ReactNode } from 'react'
import Iridescence from './ui/Iridescence'

interface IridescenceLayoutProps {
  children: ReactNode
  className?: string
}

const IridescenceLayout = memo(function IridescenceLayout({ 
  children, 
  className = 'min-h-screen relative' 
}: IridescenceLayoutProps) {
  // Memoize the color array to prevent re-renders
  const iridescenceColor = useMemo<[number, number, number]>(() => [0.4, 0.7, 0.9], [])

  return (
    <div className={className}>
      {/* Iridescent Background - MedThread brand colors (cyan/blue tones) */}
      <div className="fixed inset-0 -z-10">
        <Iridescence 
          color={iridescenceColor} 
          mouseReact 
          amplitude={0.1} 
          speed={0.8} 
        />
      </div>
      {children}
    </div>
  )
})

export default IridescenceLayout
