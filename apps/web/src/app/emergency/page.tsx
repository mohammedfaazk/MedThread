'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { RightSidebar } from '@/components/RightSidebar'

export default function EmergencyPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <div className="bg-red-50 border-2 border-red-300 rounded p-6 mb-4">
            <div className="flex items-start gap-4">
              <span className="text-4xl">🚨</span>
              <div>
                <h1 className="text-2xl font-bold text-red-700 mb-2">Emergency Medical Posts</h1>
                <p className="text-red-600 mb-4">
                  If you are experiencing a medical emergency, please call emergency services immediately.
                </p>
                <div className="flex gap-3">
                  <button className="px-6 py-2 bg-red-600 text-white rounded-full font-semibold hover:bg-red-700">
                    Call 911
                  </button>
                  <button className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-full font-semibold hover:bg-red-50">
                    Find Hospital
                  </button>
                </div>
              </div>
            </div>
          </div>
          <PostFeed />
        </main>
        <RightSidebar />
      </div>
    </div>
  )
}