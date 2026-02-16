'use client'

import { useStore } from '@/store/useStore'
import { PostCard } from './PostCard'
import { useEffect } from 'react'
import { Flame, Sparkles, ArrowUp, TrendingUp } from 'lucide-react'

interface PostFeedProps {
  community?: string
}

export function PostFeed({ community }: PostFeedProps = {}) {
  const { posts, fetchPosts, sortBy, setSortBy, loading } = useStore()

  useEffect(() => {
    // Fetch posts from API
    fetchPosts({ community, sort: sortBy })
  }, [community, sortBy, fetchPosts])

  // Filter hidden posts
  const visiblePosts = posts.filter(post => !post.isHidden)

  return (
    <div className="space-y-3">
      {/* Sort Options */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-3 flex items-center gap-2 shadow-soft">
        <button
          onClick={() => setSortBy('hot')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'hot' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Flame className="w-4 h-4" />
          Hot
        </button>
        <button
          onClick={() => setSortBy('new')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'new' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          New
        </button>
        <button
          onClick={() => setSortBy('top')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'top' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <ArrowUp className="w-4 h-4" />
          Top
        </button>
        <button
          onClick={() => setSortBy('rising')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            sortBy === 'rising' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Rising
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading posts...</p>
        </div>
      )}

      {/* Posts */}
      {!loading && visiblePosts.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <p className="text-gray-500">No posts found{community ? ' in this community' : ''} yet.</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to create a post!</p>
        </div>
      ) : (
        !loading && visiblePosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))
      )}
    </div>
  )
}