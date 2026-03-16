import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface User {
  id: string
  username: string
  role: string
  karma: number
  avatar?: string
  isPremium: boolean
}

interface Post {
  id: string
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'gallery'
  title: string
  content?: string
  url?: string
  mediaUrls?: string[]
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  specialty?: string
  community: string
  timeAgo: string
  upvotes: number
  downvotes: number
  score: number
  comments: number
  doctorReplies: number
  tags: string[]
  flair?: string
  isPinned?: boolean
  isNSFW?: boolean
  isSpoiler?: boolean
  isLocked?: boolean
  isArchived?: boolean
  userVote?: 1 | -1 | null
  isSaved?: boolean
  isHidden?: boolean
  editedAt?: string | null
  // Endorsement
  endorsementCount?: number
  userEndorsed?: boolean
  // Priority system fields
  urgencyScore?: number
  priorityLevel?: 'HIGH' | 'MEDIUM' | 'LOW'
  detectedSymptoms?: Array<{
    symptom: string
    weight: number
    category: string
  }>
}

interface Comment {
  id: string
  postId: string
  parentId?: string
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  content: string
  upvotes: number
  downvotes: number
  score: number
  depth: number
  replies: Comment[]
  isStickied?: boolean
  isDistinguished?: boolean
  isCollapsed?: boolean
  userVote?: 1 | -1 | null
  timeAgo: string
  // Location proximity fields
  locationTier?: number   // 0=exact, 1=city zone, 2=region, 3=state zone, 4=doctor/no match, 5=non-doctor
  authorPincode?: string
}

interface AppState {
  user: User | null
  posts: Post[]
  comments: Record<string, Comment[]>
  sortBy: 'hot' | 'new' | 'top' | 'rising' | 'controversial'
  loading: boolean
  error: string | null
  
  // Actions
  setUser: (user: User | null) => void
  setPosts: (posts: Post[]) => void
  setSortBy: (sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial') => void
  fetchPosts: (options?: { community?: string; sort?: string; limit?: number }) => Promise<void>
  votePost: (postId: string, value: 1 | -1, token?: string) => Promise<void>
  voteComment: (commentId: string, value: 1 | -1) => void
  savePost: (postId: string, token?: string) => Promise<void>
  hidePost: (postId: string, token?: string) => Promise<void>
  addComment: (comment: Comment) => void
  collapseComment: (commentId: string) => void
  fetchComments: (postId: string) => Promise<void>
}

// Helper to get time ago string
function getTimeAgo(date: Date | string): string {
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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      posts: [],
      comments: {},
      sortBy: 'hot',
      loading: false,
      error: null,
      
      setUser: (user) => set({ user }),
      
      setPosts: (posts) => set({ posts }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      fetchPosts: async (options = {}) => {
        set({ loading: true, error: null })
        try {
          const { community, sort = 'hot', limit = 20 } = options
          const params = new URLSearchParams()
          if (community) params.append('community', community)
          params.append('sort', sort)
          params.append('limit', limit.toString())
          
          const response = await axios.get(`${API_URL}/api/v1/posts?${params}`)
          // Handle both response formats: {success: true, data: posts} or posts array
          const apiPosts = response.data.data || response.data
          
          // Transform API posts to match our Post interface
          const transformedPosts: Post[] = (Array.isArray(apiPosts) ? apiPosts : []).map((post: any) => ({
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
            doctorReplies: 0, // TODO: Calculate from comments
            tags: [], // TODO: Add tags support
            flair: post.flair?.text,
            isPinned: post.isPinned,
            isNSFW: post.isNSFW,
            isSpoiler: post.isSpoiler,
            isLocked: post.isLocked,
            isArchived: post.isArchived,
            userVote: post.userVote || null,
            isSaved: post.isSaved || false,
            isHidden: post.isHidden || false,
            editedAt: post.editedAt || null,
            endorsementCount: post.endorsementCount || 0,
            userEndorsed: post.userEndorsed || false,
            // Priority system fields
            urgencyScore: post.priority?.urgencyScore || 0,
            priorityLevel: post.priority?.priorityLevel || 'LOW',
            detectedSymptoms: post.priority?.detectedSymptoms || []
          }))
          
          set({ posts: transformedPosts, loading: false })
        } catch (error: any) {
          console.error('Failed to fetch posts:', error)
          console.error('Error details:', error.response?.data)
          set({ error: error.message, loading: false, posts: [] })
        }
      },
      
      votePost: async (postId, value, token) => {
        // Optimistic update
        set((state) => ({
          posts: state.posts.map(post => {
            if (post.id === postId) {
              const oldVote = post.userVote || 0
              const newVote = post.userVote === value ? 0 : value
              const scoreDiff = newVote - oldVote
              
              return {
                ...post,
                userVote: newVote === 0 ? null : newVote,
                score: post.score + scoreDiff,
                upvotes: newVote === 1 ? post.upvotes + 1 : post.upvotes - (oldVote === 1 ? 1 : 0),
                downvotes: newVote === -1 ? post.downvotes + 1 : post.downvotes - (oldVote === -1 ? 1 : 0)
              }
            }
            return post
          })
        }))
        
        // API call
        if (token) {
          try {
            await axios.post(
              `${API_URL}/api/v1/posts/${postId}/vote`,
              { value },
              { headers: { Authorization: `Bearer ${token}` } }
            )
          } catch (error) {
            console.error('Failed to vote on post:', error)
            // Revert optimistic update on error
            set((state) => ({
              posts: state.posts.map(post => {
                if (post.id === postId) {
                  const oldVote = post.userVote || 0
                  const newVote = post.userVote === value ? 0 : value
                  const scoreDiff = -(newVote - oldVote)
                  
                  return {
                    ...post,
                    userVote: oldVote === 0 ? null : oldVote,
                    score: post.score + scoreDiff,
                    upvotes: oldVote === 1 ? post.upvotes + 1 : post.upvotes - (newVote === 1 ? 1 : 0),
                    downvotes: oldVote === -1 ? post.downvotes + 1 : post.downvotes - (newVote === -1 ? 1 : 0)
                  }
                }
                return post
              })
            }))
          }
        }
      },
      
      voteComment: (commentId, value) => set((state) => {
        const updateCommentVote = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const oldVote = comment.userVote || 0
              const newVote = comment.userVote === value ? 0 : value
              const scoreDiff = newVote - oldVote
              
              return {
                ...comment,
                userVote: newVote === 0 ? null : newVote,
                score: comment.score + scoreDiff,
                upvotes: newVote === 1 ? comment.upvotes + 1 : comment.upvotes - (oldVote === 1 ? 1 : 0),
                downvotes: newVote === -1 ? comment.downvotes + 1 : comment.downvotes - (oldVote === -1 ? 1 : 0)
              }
            }
            if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentVote(comment.replies)
              }
            }
            return comment
          })
        }
        
        const newComments = { ...state.comments }
        Object.keys(newComments).forEach(postId => {
          newComments[postId] = updateCommentVote(newComments[postId])
        })
        
        return { comments: newComments }
      }),
      
      savePost: async (postId, token) => {
        // Optimistic update
        set((state) => ({
          posts: state.posts.map(post =>
            post.id === postId ? { ...post, isSaved: !post.isSaved } : post
          )
        }))
        
        // API call
        if (token) {
          try {
            await axios.post(
              `${API_URL}/api/v1/posts/${postId}/save`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
          } catch (error) {
            console.error('Failed to save post:', error)
            // Revert on error
            set((state) => ({
              posts: state.posts.map(post =>
                post.id === postId ? { ...post, isSaved: !post.isSaved } : post
              )
            }))
          }
        }
      },
      
      hidePost: async (postId, token) => {
        // Optimistic update
        set((state) => ({
          posts: state.posts.map(post =>
            post.id === postId ? { ...post, isHidden: !post.isHidden } : post
          )
        }))
        
        // API call
        if (token) {
          try {
            await axios.post(
              `${API_URL}/api/v1/posts/${postId}/hide`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            )
          } catch (error) {
            console.error('Failed to hide post:', error)
            // Revert on error
            set((state) => ({
              posts: state.posts.map(post =>
                post.id === postId ? { ...post, isHidden: !post.isHidden } : post
              )
            }))
          }
        }
      },
      
      addComment: (comment) => set((state) => {
        const postComments = state.comments[comment.postId] || []
        return {
          comments: {
            ...state.comments,
            [comment.postId]: [...postComments, comment]
          }
        }
      }),
      
      fetchComments: async (postId) => {
        try {
          const token = localStorage.getItem('auth_token')
          const headers: Record<string, string> = {}
          if (token) headers['Authorization'] = `Bearer ${token}`

          const response = await axios.get(`${API_URL}/api/v1/comments?postId=${postId}`, { headers })
          const apiComments = response.data
          
          // Transform API comments to match our Comment interface
          const transformComments = (comments: any[]): Comment[] => {
            return comments.map((comment: any) => ({
              id: comment.id,
              postId: comment.postId,
              parentId: comment.parentId,
              author: comment.author?.username || 'Unknown',
              authorType: (comment.author?.role === 'VERIFIED_DOCTOR' || comment.author?.role === 'DOCTOR') ? 'doctor' : 'patient',
              verified: comment.author?.role === 'VERIFIED_DOCTOR' || (comment.author?.role === 'DOCTOR' && comment.author?.doctorVerificationStatus === 'APPROVED'),
              content: comment.content,
              upvotes: comment.upvotes || 0,
              downvotes: comment.downvotes || 0,
              score: comment.score || 0,
              depth: comment.depth || 0,
              replies: comment.replies ? transformComments(comment.replies) : [],
              isStickied: comment.isStickied,
              isDistinguished: comment.isDistinguished,
              isCollapsed: false,
              userVote: comment.userVote || null,
              timeAgo: getTimeAgo(comment.createdAt),
              locationTier: comment.locationTier,
              authorPincode: comment.author?.pincode,
            }))
          }
          
          const transformedComments = transformComments(apiComments)
          
          set((state) => ({
            comments: {
              ...state.comments,
              [postId]: transformedComments
            }
          }))
        } catch (error) {
          console.error('Failed to fetch comments:', error)
        }
      },
      
      collapseComment: (commentId) => set((state) => {
        const toggleCollapse = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, isCollapsed: !comment.isCollapsed }
            }
            if (comment.replies.length > 0) {
              return { ...comment, replies: toggleCollapse(comment.replies) }
            }
            return comment
          })
        }
        
        const newComments = { ...state.comments }
        Object.keys(newComments).forEach(postId => {
          newComments[postId] = toggleCollapse(newComments[postId])
        })
        
        return { comments: newComments }
      })
    }),
    {
      name: 'medthread-storage',
      partialize: (state) => ({ user: state.user, sortBy: state.sortBy })
    }
  )
)