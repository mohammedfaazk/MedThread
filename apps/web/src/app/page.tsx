'use client'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { RightSidebar } from '@/components/RightSidebar'
import { PostFeedWithPresets } from '@/components/PostFeedWithPresets'

export default function Home() {
  return (
    <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-6 px-6 pb-12">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostFeedWithPresets />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}
