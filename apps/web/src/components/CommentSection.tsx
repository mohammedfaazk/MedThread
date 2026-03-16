'use client'

import { useState, useEffect } from 'react'
import { Comment } from './Comment'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useStore } from '@/store/useStore'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CommentData {
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
  replies: CommentData[]
  timeAgo: string
  userVote?: 1 | -1 | null
  locationTier?: number
  authorPincode?: string
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<'best' | 'top' | 'new' | 'controversial'>('best')
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<CommentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { user, role, loading: userLoading } = useJWTAuth()
  const { fetchComments: fetchCommentsFromStore, comments: storeComments } = useStore()

  // Fetch comments on mount
  useEffect(() => {
    const loadComments = async () => {
      setIsLoading(true)
      try {
        await fetchCommentsFromStore(postId)
      } catch (error) {
        console.error('Failed to load comments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [postId, fetchCommentsFromStore])

  // Update local comments when store changes
  useEffect(() => {
    const postComments = storeComments[postId] || []
    setComments(postComments as CommentData[])
  }, [storeComments, postId])

  const handleComment = async () => {
    if (!commentText.trim() || !user) return

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('auth_token')
      
      const response = await axios.post(
        `${API_URL}/api/v1/comments`,
        {
          content: commentText,
          postId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Refresh comments
      await fetchCommentsFromStore(postId)
      setCommentText('')
    } catch (error: any) {
      console.error('Failed to create comment:', error)
      alert(error.response?.data?.message || 'Failed to create comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddReply = async (parentId: string, replyContent: string) => {
    if (!replyContent.trim() || !user) return

    try {
      const token = localStorage.getItem('auth_token')
      
      await axios.post(
        `${API_URL}/api/v1/comments`,
        {
          content: replyContent,
          postId,
          parentId
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      // Refresh comments
      await fetchCommentsFromStore(postId)
    } catch (error: any) {
      console.error('Failed to create reply:', error)
      alert(error.response?.data?.message || 'Failed to create reply. Please try again.')
    }
  }

  if (userLoading || isLoading) return <div className="p-4 text-gray-500">Loading comments...</div>

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg hover:shadow-xl transition-all">
      {/* Comment Input - For both doctors and patients */}
      {user ? (
        <div className="p-4 border-b border-neutral-400/20">
          <p className="text-sm text-gray-600 mb-2">
            Comment as <span className="text-blue-600 font-semibold">{user?.username || user?.email}</span>
            {role === 'VERIFIED_DOCTOR' && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                Verified Doctor
              </span>
            )}
          </p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full px-3 py-2 border border-neutral-400/20 rounded-xl focus:outline-none focus:border-blue-400/40 focus:ring-4 focus:ring-blue-100/50 resize-none bg-white/50 backdrop-blur-sm transition-all"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setCommentText('')}
              className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-neutral-300/20 rounded-full transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleComment}
              disabled={!commentText.trim() || isSubmitting}
              className="px-4 py-1.5 text-sm font-semibold bg-[#00BCD4] text-white rounded-full hover:bg-[#00ACC1] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {isSubmitting ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-neutral-400/20 bg-neutral-300/10 backdrop-blur-sm">
          <p className="text-sm text-gray-500 italic">Please log in to comment.</p>
        </div>
      )}

      {/* Comments */}
      <div className="divide-y divide-neutral-400/20">
        {comments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <Comment key={comment.id} {...comment} onAddReply={handleAddReply} />
          ))
        )}
      </div>
    </div>
  )
}