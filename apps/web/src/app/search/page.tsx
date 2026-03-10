'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { PostCard } from '@/components/PostCard'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import axios from 'axios'
import { FileText, Users, Hash, User, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import { highlightText, highlightAndTruncate } from '@/utils/highlightText'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SearchResults {
  posts: any[]
  users: any[]
  communities: any[]
  total: number
}

function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const type = searchParams.get('type') || 'all'
  const { addToHistory } = useSearchHistory()
  
  const [results, setResults] = useState<SearchResults>({
    posts: [],
    users: [],
    communities: [],
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'posts' | 'users' | 'communities'>(type as any)

  useEffect(() => {
    if (query) {
      // Add to search history
      addToHistory(query, activeTab)
      searchAll()
    }
  }, [query, activeTab])

  const searchAll = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/v1/search`, {
        params: {
          q: query,
          type: activeTab,
          limit: 20
        }
      })
      
      if (response.data.success) {
        setResults(response.data.data)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: 'all' | 'posts' | 'users' | 'communities') => {
    setActiveTab(tab)
    router.push(`/search?q=${encodeURIComponent(query)}&type=${tab}`)
  }

  if (!query) {
    return (
      <main className="flex-1 max-w-[640px]">
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-soft">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Start Searching</h2>
          <p className="text-gray-600">Enter a search term to find posts, users, and communities</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 max-w-[640px]">
      {/* Search Header */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 mb-4 shadow-soft">
        <h1 className="text-xl font-bold text-gray-800">Search results for "{query}"</h1>
        <p className="text-sm text-gray-600 mt-1">
          {loading ? 'Searching...' : `Found ${results.total} results`}
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-3 mb-4 flex items-center gap-2 shadow-soft">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'all' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <FileText className="w-4 h-4" />
          All
        </button>
        <button
          onClick={() => handleTabChange('posts')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'posts' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <FileText className="w-4 h-4" />
          Posts {results.posts.length > 0 && `(${results.posts.length})`}
        </button>
        <button
          onClick={() => handleTabChange('users')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Users className="w-4 h-4" />
          Users {results.users.length > 0 && `(${results.users.length})`}
        </button>
        <button
          onClick={() => handleTabChange('communities')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition flex items-center gap-2 ${
            activeTab === 'communities' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          <Hash className="w-4 h-4" />
          Communities {results.communities.length > 0 && `(${results.communities.length})`}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-soft">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Searching...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="space-y-3">
          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h2 className="text-lg font-bold text-gray-800 px-2">Posts</h2>
              )}
              {results.posts.map((post) => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  type={post.type}
                  title={post.title}
                  content={post.content}
                  url={post.url}
                  mediaUrls={post.mediaUrls}
                  author={post.author?.username || 'Unknown'}
                  authorType={
                    post.author?.role === 'VERIFIED_DOCTOR' || post.author?.role === 'DOCTOR'
                      ? 'doctor'
                      : 'patient'
                  }
                  verified={
                    post.author?.role === 'VERIFIED_DOCTOR' ||
                    (post.author?.role === 'DOCTOR' && post.author?.doctorVerificationStatus === 'APPROVED')
                  }
                  specialty={post.author?.specialty}
                  community={post.community?.name || 'general'}
                  timeAgo={new Date(post.createdAt).toLocaleDateString()}
                  upvotes={post.upvotes || 0}
                  downvotes={post.downvotes || 0}
                  score={post.score || 0}
                  comments={post.commentCount || 0}
                  doctorReplies={0}
                  tags={[]}
                  isPinned={post.isPinned}
                  editedAt={post.editedAt}
                />
              ))}
            </div>
          )}

          {/* Users */}
          {(activeTab === 'all' || activeTab === 'users') && results.users.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h2 className="text-lg font-bold text-gray-800 px-2 mt-6">Users</h2>
              )}
              {results.users.map((user) => (
                <Link
                  key={user.id}
                  href={`/u/${user.username}`}
                  className="block bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 hover:shadow-elevated transition-all shadow-soft"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-800">
                          u/{highlightText(user.username, query)}
                        </h3>
                        {(user.role === 'VERIFIED_DOCTOR' || 
                          (user.role === 'DOCTOR' && user.doctorVerificationStatus === 'APPROVED')) && (
                          <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                        )}
                      </div>
                      {user.specialty && (
                        <p className="text-sm text-gray-600">
                          {highlightText(user.specialty, query)}
                        </p>
                      )}
                      {user.bio && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {highlightAndTruncate(user.bio, query, 150)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{user.totalKarma || 0} karma</span>
                        <span>{user._count?.posts || 0} posts</span>
                        <span>{user._count?.comments || 0} comments</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Communities */}
          {(activeTab === 'all' || activeTab === 'communities') && results.communities.length > 0 && (
            <div className="space-y-3">
              {activeTab === 'all' && (
                <h2 className="text-lg font-bold text-gray-800 px-2 mt-6">Communities</h2>
              )}
              {results.communities.map((community) => (
                <Link
                  key={community.id}
                  href={`/m/${community.name}`}
                  className="block bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 hover:shadow-elevated transition-all shadow-soft"
                >
                  <div className="flex items-center gap-4">
                    {community.icon ? (
                      <img
                        src={community.icon}
                        alt={community.displayName}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
                        {community.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">
                        {highlightText(community.displayName, query)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        m/{highlightText(community.name, query)}
                      </p>
                      {community.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {highlightAndTruncate(community.description, query, 150)}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>{community._count?.members || 0} members</span>
                        <span>{community._count?.posts || 0} posts</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results.total === 0 && (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-soft">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-700 mb-2">No results found</h2>
              <p className="text-gray-600">Try different keywords or check your spelling</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}

export default function SearchPage() {
  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <NavbarEnhanced />
        <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
          <Sidebar />
          <Suspense fallback={
            <div className="flex-1 max-w-[640px] p-4 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading search results...</p>
            </div>
          }>
            <SearchResults />
          </Suspense>
        </div>
      </div>
    </IridescenceLayout>
  )
}
