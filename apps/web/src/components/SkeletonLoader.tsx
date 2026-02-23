'use client'

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card'
  width?: string
  height?: string
  count?: number
  className?: string
}

export function SkeletonLoader({ 
  variant = 'rectangular',
  width = '100%',
  height = '20px',
  count = 1,
  className = ''
}: SkeletonLoaderProps) {
  const baseClasses = 'skeleton animate-pulse bg-gray-200 rounded'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    card: 'rounded-2xl'
  }

  const skeletonElement = (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={{ width, height }}
    />
  )

  if (count === 1) {
    return skeletonElement
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  )
}

export function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="120px" />
          <SkeletonLoader variant="text" width="80px" height="12px" />
        </div>
      </div>
      <SkeletonLoader variant="text" count={3} />
      <div className="flex gap-4 pt-2">
        <SkeletonLoader variant="rectangular" width="60px" height="32px" />
        <SkeletonLoader variant="rectangular" width="60px" height="32px" />
        <SkeletonLoader variant="rectangular" width="60px" height="32px" />
      </div>
    </div>
  )
}
