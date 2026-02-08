'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'

export default function CommunityPage({ params }: { params: { community: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Community Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-gray-700 text-2xl font-bold shadow-soft">
              {params.community[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">m/{params.community}</h1>
              <p className="text-sm text-gray-600">Medical community for {params.community}</p>
            </div>
            <button className="ml-auto px-6 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-soft hover:shadow-elevated">
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
