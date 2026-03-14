'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/store/useStore'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { User, Stethoscope, CheckCircle } from 'lucide-react'
import { AwardButton } from './AwardButton'
import { AwardDisplay } from './AwardDisplay'
import ReportButton from './ReportButton'
import { analytics } from '@/lib/analytics'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface CommentProps {
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
  replies: CommentProps[]
  timeAgo: string
  userVote?: 1 | -1 | null
  isCollapsed?: boolean
  onAddReply?: (parentId: string, replyContent: string) => void
}

export function Comment({
  id,
  postId,
  author,
  authorType,
  verified,
  content,
  score,
  depth,
  replies,
  timeAgo,
  userVote,
  isCollapsed,
  onAddReply
}: CommentProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed || false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [saved, setSaved] = useState(false)
  const [localVote, setLocalVote] = useState<1 | -1 | null>(userVote || null)
  const [localScore, setLocalScore] = useState(score)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(content)
  const [localContent, setLocalContent] = useState(content)
  const [isDeleted, setIsDeleted] = useState(content === '[deleted]')
  const [commentAwards, setCommentAwards] = useState<any[]>([])
  const [awardsLoading, setAwardsLoading] = useState(false)
  const { user, role } = useJWTAuth()
  
  const isAuthor = user?.username === author
  const isUnverifiedDoctor = role === 'DOCTOR' && user?.doctorVerificationStatus !== 'APPROVED'

  useEffect(() => {
    fetchCommentAwards()
  }, [id])

  const fetchCommentAwards = async () => {
    setAwardsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/v1/awards/comment/${id}`)
      if (response.data.success && response.data.data.awards) {
        setCommentAwards(response.data.data.awards)
      }
    } catch (error) {
      console.error('Failed to fetch comment awards:', error)
    } finally {
      setAwardsLoading(false)
    }
  }

  const handleVote = async (value: 1 | -1) => {
    const oldVote = localVote || 0
    const newVote = localVote === value ? 0 : value
    const scoreDiff = newVote - oldVote
    
    // Optimistic update
    setLocalVote(newVote === 0 ? null : newVote)
    setLocalScore(localScore + scoreDiff)

    // API call
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await axios.post(
          `${API_URL}/api/v1/comments/${id}/vote`,
          { value },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
    } catch (error) {
      console.error('Failed to vote on comment:', error)
      // Revert on error
      setLocalVote(oldVote === 0 ? null : oldVote)
      setLocalScore(localScore)
    }
    
    analytics.trackEvent('comment_vote', 'engagement', { commentId: id, vote: value })
  }

  const handleReply = () => {
    if (!replyText.trim() || !user) return
    
    if (isUnverifiedDoctor) {
      alert('Doctor verification required. Please complete the verification process before commenting.')
      return
    }
    
    if (onAddReply) {
      onAddReply(id, replyText)
    }
    
    setReplyText('')
    setShowReply(false)
    analytics.trackEvent('comment_reply', 'engagement', { commentId: id })
  }

  const handleSave = () => {
    setSaved(!saved)
    analytics.trackEvent('comment_save', 'engagement', { commentId: id })
  }

  const handleShare = () => {
    const link = `${window.location.origin}/post/${postId}#comment-${id}`
    navigator.clipboard.writeText(link)
    alert('Comment link copied to clipboard!')
    analytics.trackShare('comment', id, 'clipboard')
  }

  const handleEdit = async () => {
    if (!editText.trim() || editText === localContent) {
      setIsEditing(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await axios.put(
          `${API_URL}/api/v1/comments/${id}`,
          { content: editText },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setLocalContent(editText)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Failed to edit comment:', error)
      alert('Failed to edit comment. Please try again.')
      setEditText(localContent)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        await axios.delete(
          `${API_URL}/api/v1/comments/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        setLocalContent('[deleted]')
        setIsDeleted(true)
      }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('Failed to delete comment. Please try again.')
    }
  }

  if (collapsed) {
    return (
      <div className="p-3 hover:bg-neutral-300/20 cursor-pointer rounded-xl transition-all backdrop-blur-sm" onClick={() => setCollapsed(false)}>
        <span className="text-sm text-gray-600">
          [+] {author} ({localScore} points) - {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>
    )
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-neutral-400/20 pl-4' : 'p-4'}`}>
      <div className="flex gap-2">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 hover:bg-neutral-300/20 rounded-full transition-all ${
              localVote === 1 ? 'text-yellow-200' : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill={localVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-xs font-bold ${
            localVote === 1 ? 'text-yellow-200' : localVote === -1 ? 'text-blue-500' : 'text-gray-600'
          }`}>
            {localScore}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 hover:bg-neutral-300/20 rounded-full transition-all ${
              localVote === -1 ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill={localVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            {isDeleted ? (
              <span className="font-semibold text-charcoal flex items-center gap-1">
                {authorType === 'doctor' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
                [deleted]
              </span>
            ) : (
              <Link 
                href={`/u/${author}`}
                className="font-semibold hover:underline cursor-pointer text-charcoal flex items-center gap-1 transition-colors hover:text-blue-600"
              >
                {authorType === 'doctor' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {author}
              </Link>
            )}
            {verified && !isDeleted && (
              <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Doctor
              </span>
            )}
            <span className="text-gray-500">• {timeAgo}</span>
            {localContent !== content && !isDeleted && (
              <span className="text-gray-500 italic">• edited</span>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="mb-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 resize-none bg-white/50 backdrop-blur-xl transition-all"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditText(localContent)
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-neutral-300/20 rounded-full transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={!editText.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className={`text-sm mb-2 ${isDeleted ? 'text-gray-500 italic' : 'text-gray-800'}`}>
                {localContent}
              </p>
              {/* Awards Display */}
              {commentAwards.length > 0 && (
                <div className="mb-2">
                  <AwardDisplay awards={commentAwards} size="small" />
                </div>
              )}
            </>
          )}

          {/* Actions */}
          {!isDeleted && (
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <button
                onClick={() => setShowReply(!showReply)}
                className="font-semibold hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all"
              >
                Reply
              </button>
              <AwardButton commentId={id} currentAwards={commentAwards} onAwardGiven={fetchCommentAwards} />
              {isAuthor && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="hover:bg-red-100 text-red-600 px-2 py-1 rounded-full transition-all"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={handleShare}
                className="hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all"
              >
                Share
              </button>
              {/* Only show report button if not the author */}
              {!isAuthor && (
                <ReportButton 
                  type="comment" 
                  targetId={id} 
                  targetTitle={content.substring(0, 50) + '...'}
                  className="hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all"
                />
              )}
              <button
                onClick={handleSave}
                className={`hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all ${saved ? 'text-yellow-200 font-semibold' : ''}`}
              >
                {saved ? 'Saved' : 'Save'}
              </button>
              {replies.length > 0 && (
                <button
                  onClick={() => setCollapsed(true)}
                  className="hover:bg-neutral-300/20 px-2 py-1 rounded-full transition-all"
                >
                  [-] Collapse
                </button>
              )}
            </div>
          )}

          {/* Reply box */}
          {showReply && user && (
            <div className="mt-3">
              {isUnverifiedDoctor ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800 font-semibold mb-2">
                    Doctor Verification Required
                  </p>
                  <p className="text-xs text-red-700 mb-2">
                    Your doctor account must be verified before you can comment.
                  </p>
                  <button
                    onClick={() => window.location.href = '/doctor-verification'}
                    className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Complete Verification
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-600 mb-2">
                    Reply as <span className="text-blue-600 font-semibold">{user?.username || user?.email}</span>
                  </p>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="What are your thoughts?"
                    className="w-full px-3 py-2 border border-neutral-400/20 rounded-xl text-sm focus:outline-none focus:border-blue-400/40 resize-none bg-white/50 backdrop-blur-xl transition-all"
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setShowReply(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-neutral-300/20 rounded-full transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReply}
                      disabled={!replyText.trim()}
                      className="px-3 py-1.5 text-xs font-semibold bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      Reply
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              {replies.map((reply) => (
                <Comment key={reply.id} {...reply} onAddReply={onAddReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}