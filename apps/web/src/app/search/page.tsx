'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SearchResults() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return (
    <main className="flex-1 max-w-[640px]">
      <div className="bg-white rounded border border-gray-300 p-4 mb-4">
        <h1 className="text-xl font-bold">Search results for "{query}"</h1>
        <p className="text-sm text-gray-600 mt-1">Found 42 results</p>
      </div>
      <PostFeed />
    </main>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <Suspense fallback={<div className="flex-1 max-w-[640px] p-4 text-center">Loading search results...</div>}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}