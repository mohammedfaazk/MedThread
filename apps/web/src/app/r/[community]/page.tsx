'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'

export default function CommunityPage({ params }: { params: { community: string } }) {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      
      {/* Community Header */}
      <div className="bg-white border-b border-gray-300">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {params.community[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">r/{params.community}</h1>
              <p className="text-sm text-gray-600">Medical community for {params.community}</p>
            </div>
            <button className="ml-auto px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722]">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostFeed />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}