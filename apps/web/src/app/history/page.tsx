'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'

export default function HistoryPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 mb-4 shadow-soft">
            <h1 className="text-2xl font-bold text-charcoal">History</h1>
            <p className="text-sm text-gray-600 mt-1">Posts you've recently viewed</p>
          </div>
          <PostFeed />
        </main>
      </div>
    </div>
  )
}