import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  severity?: 'low' | 'moderate' | 'high'
  isPinned?: boolean
  isNSFW?: boolean
  isSpoiler?: boolean
  isLocked?: boolean
  isArchived?: boolean
  userVote?: 1 | -1 | null
  isSaved?: boolean
  isHidden?: boolean
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
}

interface AppState {
  user: User | null
  posts: Post[]
  comments: Record<string, Comment[]>
  sortBy: 'hot' | 'new' | 'top' | 'rising' | 'controversial'
  
  // Actions
  setUser: (user: User | null) => void
  setPosts: (posts: Post[]) => void
  setSortBy: (sort: 'hot' | 'new' | 'top' | 'rising' | 'controversial') => void
  votePost: (postId: string, value: 1 | -1) => void
  voteComment: (commentId: string, value: 1 | -1) => void
  savePost: (postId: string) => void
  hidePost: (postId: string) => void
  addComment: (comment: Comment) => void
  collapseComment: (commentId: string) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      posts: [],
      comments: {},
      sortBy: 'hot',
      
      setUser: (user) => set({ user }),
      
      setPosts: (posts) => set({ posts }),
      
      setSortBy: (sortBy) => set({ sortBy }),
      
      votePost: (postId, value) => set((state) => ({
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
      })),
      
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
      
      savePost: (postId) => set((state) => ({
        posts: state.posts.map(post =>
          post.id === postId ? { ...post, isSaved: !post.isSaved } : post
        )
      })),
      
      hidePost: (postId) => set((state) => ({
        posts: state.posts.map(post =>
          post.id === postId ? { ...post, isHidden: !post.isHidden } : post
        )
      })),
      
      addComment: (comment) => set((state) => {
        const postComments = state.comments[comment.postId] || []
        return {
          comments: {
            ...state.comments,
            [comment.postId]: [...postComments, comment]
          }
        }
      }),
      
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