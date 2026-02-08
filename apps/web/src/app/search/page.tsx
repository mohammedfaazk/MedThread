'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { useSearchParams } from 'next/navigation'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 mb-4 shadow-soft">
            <h1 className="text-xl font-bold text-charcoal">Search results for "{query}"</h1>
            <p className="text-sm text-gray-600 mt-1">Found 42 results</p>
          </div>
          <PostFeed />
        </main>
      </div>
    </div>
  )
}