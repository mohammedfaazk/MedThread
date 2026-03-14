'use client'

import { Sidebar } from '@/components/Sidebar'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { useEffect, useState } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useStore } from '@/store/useStore'
import { EyeOff, Eye } from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function HiddenPostsPage() {
  const { user } = useJWTAuth()
  const { hidePost } = useStore()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get(`${API_URL}/api/v1/posts/hidden`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // Transform API posts
        const transformedPosts = response.data.map((post: any) => ({
          id: post.id,
          type: post.type?.toLowerCase() || 'text',
          title: post.title,
          content: post.content,
          url: post.url,
          mediaUrls: post.mediaUrls || [],
          author: post.author?.username || 'Unknown',
          authorType: (post.author?.role === 'VERIFIED_DOCTOR' || post.author?.role === 'DOCTOR') ? 'doctor' : 'patient',
          verified: post.author?.role === 'VERIFIED_DOCTOR' || (post.author?.role === 'DOCTOR' && post.author?.doctorVerificationStatus === 'APPROVED'),
          specialty: post.author?.specialty,
          community: post.community?.name || 'general',
          timeAgo: getTimeAgo(post.createdAt),
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          score: post.score || 0,
          comments: post.commentCount || 0,
          isHidden: true,
        }))
        
        // Update store posts
        setPosts(transformedPosts)
      } catch (error) {
        console.error('Failed to fetch hidden posts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [user])

  const getTimeAgo = (date: string): string => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  const hiddenPosts = posts.filter(post => post.isHidden)

  const handleUnhide = async (postId: string) => {
    const token = localStorage.getItem('auth_token')
    await hidePost(postId, token || undefined)
  }

  if (!user) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blue-50">
          <NavbarEnhanced />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-lg">
                  <p className="text-gray-600">Please log in to view hidden posts</p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-blue-50">
        <NavbarEnhanced />
        <div className="flex">
          <Sidebar />
          
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-charcoal mb-2 flex items-center gap-2">
                  <EyeOff className="w-8 h-8" />
                  Hidden Posts
                </h1>
                <p className="text-gray-600">
                  Posts you've hidden from your feed. Click "Unhide" to show them again.
                </p>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-lg">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading hidden posts...</p>
                </div>
              )}

              {/* Empty State */}
              {!loading && hiddenPosts.length === 0 && (
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center shadow-lg">
                  <EyeOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-xl font-semibold text-charcoal mb-2">No Hidden Posts</h2>
                  <p className="text-gray-600 mb-4">
                    You haven't hidden any posts yet. Hidden posts will appear here.
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-lg"
                  >
                    Browse Posts
                  </Link>
                </div>
              )}

              {/* Hidden Posts List */}
              {!loading && hiddenPosts.length > 0 && (
                <div className="space-y-4">
                  {hiddenPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all p-4"
                    >
                      <div className="flex items-start gap-4">
                        {/* Post Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <Link href={`/m/${post.community}`} className="font-semibold hover:underline">
                              m/{post.community}
                            </Link>
                            <span className="text-gray-400">•</span>
                            <span>Posted by u/{post.author}</span>
                            <span className="text-gray-400">•</span>
                            <span>{post.timeAgo}</span>
                          </div>

                          <Link href={`/post/${post.id}`}>
                            <h2 className="text-lg font-semibold text-charcoal mb-2 hover:text-blue-600">
                              {post.title}
                            </h2>
                          </Link>

                          {post.content && (
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                              {post.content}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>{post.score} points</span>
                            <span>{post.comments} comments</span>
                          </div>
                        </div>

                        {/* Unhide Button */}
                        <button
                          onClick={() => handleUnhide(post.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-lg"
                        >
                          <Eye className="w-4 h-4" />
                          Unhide
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </IridescenceLayout>
  )
}
