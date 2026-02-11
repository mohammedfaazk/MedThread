'use client'

import { useState } from 'react'
import { Comment } from './Comment'
import { useUser } from '@/context/UserContext'

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
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<'best' | 'top' | 'new' | 'controversial'>('best')
  const [commentText, setCommentText] = useState('')
  
  // Initialize with mock data
  const [comments, setComments] = useState<CommentData[]>([
    {
      id: '1',
      postId,
      author: 'Dr_Sarah_Johnson',
      authorType: 'doctor' as const,
      verified: true,
      content: 'Based on your symptoms, this could be tension headaches or migraines. I recommend keeping a headache diary to track triggers. If they persist or worsen, definitely see your doctor for a proper evaluation.',
      upvotes: 45,
      downvotes: 2,
      score: 43,
      depth: 0,
      replies: [
        {
          id: '2',
          postId,
          parentId: '1',
          author: 'patient_anonymous',
          authorType: 'patient' as const,
          content: 'Thank you so much! I\'ll start tracking them. Should I be concerned about the evening pattern?',
          upvotes: 12,
          downvotes: 0,
          score: 12,
          depth: 1,
          replies: [],
          timeAgo: '1 hour ago'
        }
      ],
      timeAgo: '2 hours ago'
    },
    {
      id: '3',
      postId,
      author: 'health_enthusiast',
      authorType: 'patient' as const,
      content: 'I had similar symptoms last year. Turned out to be dehydration and eye strain from too much screen time. Make sure you\'re drinking enough water!',
      upvotes: 23,
      downvotes: 1,
      score: 22,
      depth: 0,
      replies: [],
      timeAgo: '3 hours ago'
    }
  ])

  const { user, role, loading: userLoading } = useUser()

  const handleComment = () => {
    if (!commentText.trim()) return

    // Create new comment
    const newComment: CommentData = {
      id: `comment-${Date.now()}`,
      postId,
      author: user?.username || user?.email?.split('@')[0] || 'Anonymous',
      authorType: role === 'VERIFIED_DOCTOR' ? 'doctor' : 'patient',
      verified: role === 'VERIFIED_DOCTOR',
      content: commentText,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      depth: 0,
      replies: [],
      timeAgo: 'Just now'
    }

    // Add comment to the list
    setComments([newComment, ...comments])
    setCommentText('')
  }

  const handleAddReply = (parentId: string, replyContent: string) => {
    if (!replyContent.trim() || !user) return

    const newReply: CommentData = {
      id: `reply-${Date.now()}`,
      postId,
      parentId,
      author: user?.username || user?.email?.split('@')[0] || 'Anonymous',
      authorType: role === 'VERIFIED_DOCTOR' ? 'doctor' : 'patient',
      verified: role === 'VERIFIED_DOCTOR',
      content: replyContent,
      upvotes: 0,
      downvotes: 0,
      score: 0,
      depth: 0,
      replies: [],
      timeAgo: 'Just now'
    }

    // Recursively add reply to the correct parent comment
    const addReplyToComment = (comments: CommentData[]): CommentData[] => {
      return comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...comment.replies, { ...newReply, depth: comment.depth + 1 }]
          }
        }
        if (comment.replies.length > 0) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies)
          }
        }
        return comment
      })
    }

    setComments(addReplyToComment(comments))
  }

  if (userLoading) return <div className="p-4 text-gray-500">Loading comments...</div>

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
              disabled={!commentText.trim()}
              className="px-4 py-1.5 text-sm font-semibold bg-[#00BCD4] text-white rounded-full hover:bg-[#00ACC1] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              Comment
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