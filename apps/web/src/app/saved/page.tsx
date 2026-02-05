'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { useStore } from '@/store/useStore'
import { PostCard } from '@/components/PostCard'

export default function SavedPage() {
  const { posts } = useStore()
  const savedPosts = posts.filter(post => post.isSaved)

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <div className="bg-white rounded border border-gray-300 p-4 mb-4">
            <h1 className="text-2xl font-bold">Saved Posts</h1>
            <p className="text-sm text-gray-600 mt-1">{savedPosts.length} saved posts</p>
          </div>
          <div className="space-y-2.5">
            {savedPosts.length > 0 ? (
              savedPosts.map(post => <PostCard key={post.id} {...post} />)
            ) : (
              <div className="bg-white rounded border border-gray-300 p-8 text-center">
                <p className="text-gray-600">No saved posts yet</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}