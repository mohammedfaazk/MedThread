'use client'

import { useStore } from '@/store/useStore'
import { PostCard } from './PostCard'
import { useEffect, useState } from 'react'
import { Flame, Sparkles, ArrowUp, TrendingUp } from 'lucide-react'
import { io, Socket } from 'socket.io-client'

interface PostFeedProps {
  community?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function PostFeed({ community }: PostFeedProps = {}) {
  const { posts, fetchPosts, sortBy, setSortBy, loading, isSocketConnected } = useStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [newPostNotification, setNewPostNotification] = useState(false)

  useEffect(() => {
    // Fetch posts from API
    fetchPosts({ community, sort: sortBy })
  }, [community, sortBy, fetchPosts])

  useEffect(() => {
    // Connect to socket server
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('[PostFeed] Socket connected:', socketInstance.id)
      useStore.setState({ isSocketConnected: true })
      
      // Register user location if available (for proximity notifications)
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.id) {
            // Join user's personal room
            socketInstance.emit('join_room', user.id)
            
            // Register location if available
            if (user.pincode || user.city || user.state) {
              socketInstance.emit('register_location', {
                userId: user.id,
                pincode: user.pincode,
                city: user.city,
                state: user.state
              })
              console.log('[PostFeed] Registered user location:', { pincode: user.pincode, city: user.city, state: user.state })
            }
          }
        } catch (error) {
          console.error('[PostFeed] Failed to parse user data:', error)
        }
      }
    })

    socketInstance.on('disconnect', () => {
      console.log('[PostFeed] Socket disconnected')
      useStore.setState({ isSocketConnected: false })
    })

    // Listen for new posts
    socketInstance.on('new_post', (data: { post: any }) => {
      console.log('[PostFeed] Received new post:', data.post)
      
      const newPost = data.post
      const currentPosts = useStore.getState().posts
      
      // Check if post already exists
      if (currentPosts.some(p => p.id === newPost.id)) {
        return
      }

      // Transform the post to match our interface
      const transformedPost = {
        id: newPost.id,
        type: newPost.type?.toLowerCase() || 'text',
        title: newPost.title,
        content: newPost.content,
        url: newPost.url,
        mediaUrls: newPost.mediaUrls || [],
        author: newPost.author?.username || 'Unknown',
        authorType: (newPost.author?.role === 'DOCTOR') ? 'doctor' : 'patient',
        verified: newPost.author?.verified || false,
        specialty: newPost.author?.specialty,
        community: newPost.community?.name || 'general',
        timeAgo: 'just now',
        upvotes: newPost.upvotes || 0,
        downvotes: newPost.downvotes || 0,
        score: newPost.score || 0,
        comments: newPost._count?.comments || 0,
        doctorReplies: 0,
        tags: newPost.tags || [],
        flair: newPost.flair?.text,
        isPinned: newPost.isPinned,
        isNSFW: newPost.isNSFW,
        isSpoiler: newPost.isSpoiler,
        isLocked: newPost.isLocked,
        isArchived: newPost.isArchived,
        userVote: null,
        isSaved: false,
        isHidden: false,
        editedAt: newPost.editedAt || null,
        endorsementCount: newPost.endorsementCount || 0,
        userEndorsed: false,
        urgencyScore: newPost.urgencyScore || newPost.priority?.urgencyScore || 0,
        priorityLevel: newPost.priorityLevel || newPost.priority?.priorityLevel || 'LOW',
        detectedSymptoms: newPost.detectedSymptoms || newPost.priority?.detectedSymptoms || []
      }

      // Insert post at correct position based on priority
      const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 }
      const newPriority = PRIORITY_ORDER[transformedPost.priorityLevel as keyof typeof PRIORITY_ORDER] ?? 2
      const newScore = transformedPost.urgencyScore || 0

      const updatedPosts = [...currentPosts]
      let insertIndex = 0

      // Find correct insertion position
      for (let i = 0; i < updatedPosts.length; i++) {
        const postPriority = PRIORITY_ORDER[updatedPosts[i].priorityLevel as keyof typeof PRIORITY_ORDER] ?? 2
        const postScore = updatedPosts[i].urgencyScore || 0

        if (newPriority < postPriority) {
          // New post has higher priority
          insertIndex = i
          break
        } else if (newPriority === postPriority && newScore > postScore) {
          // Same priority, but higher score
          insertIndex = i
          break
        }
        insertIndex = i + 1
      }

      updatedPosts.splice(insertIndex, 0, transformedPost as any)
      useStore.setState({ posts: updatedPosts })

      // Show notification if user has scrolled down
      if (window.scrollY > 200) {
        setNewPostNotification(true)
        setTimeout(() => setNewPostNotification(false), 5000)
      }
    })

    // Listen for nearby urgent posts (for doctors)
    socketInstance.on('nearby_urgent_post', (data: { post: any; notification: any }) => {
      console.log('[PostFeed] Received nearby urgent post notification:', data)
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(data.notification.title, {
          body: data.notification.message,
          icon: '/logo.png',
          badge: '/logo.png',
          tag: `post-${data.post.id}`,
        })
      }
      
      // Show in-app notification banner
      const banner = document.createElement('div')
      banner.className = 'fixed top-20 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md animate-slide-in'
      banner.innerHTML = `
        <div class="flex items-start gap-3">
          <span class="text-2xl">${data.notification.priority === 'HIGH' ? '🔴' : '🟡'}</span>
          <div class="flex-1">
            <h4 class="font-bold text-lg mb-1">${data.notification.title}</h4>
            <p class="text-sm opacity-90">${data.notification.message}</p>
            <button onclick="window.location.href='/post/${data.post.id}'" class="mt-2 bg-white text-red-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
              View Post
            </button>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-red-200 text-xl font-bold">&times;</button>
        </div>
      `
      document.body.appendChild(banner)
      
      // Auto-remove after 10 seconds
      setTimeout(() => {
        if (banner.parentElement) {
          banner.remove()
        }
      }, 10000)
    })

    setSocket(socketInstance)

    // Cleanup on unmount
    return () => {
      socketInstance.off('connect')
      socketInstance.off('disconnect')
      socketInstance.off('new_post')
      socketInstance.off('nearby_urgent_post')
      socketInstance.close()
    }
  }, [])

  // Filter hidden posts
  const visiblePosts = posts.filter(post => !post.isHidden)

  return (
    <div className="space-y-3">
      {/* New post notification */}
      {newPostNotification && (
        <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-center cursor-pointer hover:bg-blue-600 transition"
             onClick={() => {
               window.scrollTo({ top: 0, behavior: 'smooth' })
               setNewPostNotification(false)
             }}>
          New post available - Click to scroll to top
        </div>
      )}

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
        
        {/* Real-time connection indicator */}
        <div className="ml-auto flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-xs text-gray-500">
            {isSocketConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">Loading posts...</p>
        </div>
      )}

      {/* Posts with Priority Section Headers */}
      {!loading && visiblePosts.length === 0 ? (
        <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center">
          <p className="text-gray-500">No posts found{community ? ' in this community' : ''} yet.</p>
          <p className="text-gray-400 text-sm mt-2">Be the first to create a post!</p>
        </div>
      ) : (
        !loading && (() => {
          // Group posts by priority
          const highPosts = visiblePosts.filter(p => p.priorityLevel === 'HIGH')
          const mediumPosts = visiblePosts.filter(p => p.priorityLevel === 'MEDIUM')
          const lowPosts = visiblePosts.filter(p => p.priorityLevel === 'LOW')

          return (
            <>
              {/* HIGH Priority Section */}
              {highPosts.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-bold">
                    <span className="text-2xl">🔴</span>
                    <span className="text-lg">URGENT POSTS ({highPosts.length})</span>
                  </div>
                  {highPosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))}
                </>
              )}

              {/* MEDIUM Priority Section */}
              {mediumPosts.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-bold mt-4">
                    <span className="text-2xl">🟡</span>
                    <span className="text-lg">NEEDS ATTENTION ({mediumPosts.length})</span>
                  </div>
                  {mediumPosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))}
                </>
              )}

              {/* LOW Priority Section */}
              {lowPosts.length > 0 && (
                <>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 font-bold mt-4">
                    <span className="text-2xl">🟢</span>
                    <span className="text-lg">GENERAL DISCUSSION ({lowPosts.length})</span>
                  </div>
                  {lowPosts.map((post) => (
                    <PostCard key={post.id} {...post} />
                  ))}
                </>
              )}
            </>
          )
        })()
      )}
    </div>
  )
}