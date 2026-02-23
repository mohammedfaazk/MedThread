'use client'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { PostFeedWithPresets } from '@/components/PostFeedWithPresets'
import { ResponsiveContainer } from '@/components/ResponsiveContainer'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import { PullToRefreshIndicator } from '@/components/PullToRefreshIndicator'
import { useState } from 'react'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)

  const { pullDistance, isRefreshing, shouldTrigger } = usePullToRefresh({
    onRefresh: async () => {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
      setRefreshKey(prev => prev + 1)
    },
    threshold: 80
  })

  return (
    <div className="min-h-screen-dynamic">
      <PullToRefreshIndicator 
        pullDistance={pullDistance}
        threshold={80}
        isRefreshing={isRefreshing}
      />
      <NavbarEnhanced />
      <ResponsiveContainer>
        <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 pb-12">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 max-w-[640px] mx-auto w-full">
            <PostFeedWithPresets key={refreshKey} />
          </main>
          
          {/* Right Sidebar - Hidden on mobile/tablet */}
          <div className="hidden xl:block">
            <RightSidebar />
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  )
}
