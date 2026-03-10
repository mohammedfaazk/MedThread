'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { PostCard } from '@/components/PostCard'
import { useEffect, useState } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import axios from 'axios'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Post {
  id: string
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'gallery'
  title: string
  content?: string
  url?: string
  mediaUrls?: string[]
  author: { username: string; role: string; doctorVerificationStatus?: string; specialty?: string }
  community: { name: string }
  createdAt: string
  editedAt?: string
  upvotes: number
  downvotes: number
  score: number
  commentCount: number
  isPinned?: boolean
  userVote?: number
  isSaved?: boolean
}

export default function SavedPage() {
  const { user } = useJWTAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSavedPosts = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get(`${API_URL}/api/v1/posts/saved`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setPosts(response.data)
      } catch (error) {
        console.error('Failed to fetch saved posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedPosts()
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

  if (!user) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <NavbarEnhanced />
          <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
            <Sidebar />
            <main className="flex-1 max-w-[640px]">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center shadow-soft">
                <p className="text-gray-600">Please log in to view saved posts</p>
              </div>
            </main>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-4 mb-4 shadow-soft">
            <h1 className="text-2xl font-bold text-charcoal">Saved Posts</h1>
            <p className="text-sm text-gray-600 mt-1">{posts.length} saved posts</p>
          </div>
          
          {loading ? (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center shadow-soft">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard
                    key={post.id}
                    id={post.id}
                    type={post.type}
                    title={post.title}
                    content={post.content}
                    url={post.url}
                    mediaUrls={post.mediaUrls}
                    author={post.author.username}
                    authorType={(post.author.role === 'VERIFIED_DOCTOR' || post.author.role === 'DOCTOR') ? 'doctor' : 'patient'}
                    verified={post.author.role === 'VERIFIED_DOCTOR' || (post.author.role === 'DOCTOR' && post.author.doctorVerificationStatus === 'APPROVED')}
                    specialty={post.author.specialty}
                    community={post.community.name}
                    timeAgo={getTimeAgo(post.createdAt)}
                    upvotes={post.upvotes}
                    downvotes={post.downvotes}
                    score={post.score}
                    comments={post.commentCount}
                    doctorReplies={0}
                    tags={[]}
                    isPinned={post.isPinned}
                    userVote={post.userVote === 1 ? 1 : post.userVote === -1 ? -1 : null}
                    isSaved={true}
                    editedAt={post.editedAt}
                  />
                ))
              ) : (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center shadow-soft">
                  <p className="text-gray-600">No saved posts yet</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </IridescenceLayout>
  )
}