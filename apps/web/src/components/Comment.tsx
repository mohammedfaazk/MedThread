'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { User, Stethoscope, CheckCircle } from 'lucide-react'

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
  isCollapsed
}: CommentProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed || false)
  const [showReply, setShowReply] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [saved, setSaved] = useState(false)
  const { voteComment } = useStore()

  const handleVote = (value: 1 | -1) => {
    voteComment(id, value)
  }

  const handleReply = () => {
    if (!replyText.trim()) return
    
    alert(`Reply posted: "${replyText}" (This is a demo - replies will be saved in the database)`)
    setReplyText('')
    setShowReply(false)
  }

  const handleSave = () => {
    setSaved(!saved)
    alert(saved ? 'Comment unsaved' : 'Comment saved!')
  }

  const handleReport = () => {
    const reason = prompt('Why are you reporting this comment?\n\n1. Misinformation\n2. Harassment\n3. Spam\n4. Other')
    if (reason) {
      alert('Comment reported. Our moderators will review it shortly.')
    }
  }

  const handleShare = () => {
    const link = `${window.location.origin}/post/${postId}#comment-${id}`
    navigator.clipboard.writeText(link)
    alert('Comment link copied to clipboard!')
  }

  if (collapsed) {
    return (
      <div className="p-3 hover:bg-cream-50/50 cursor-pointer rounded-xl transition" onClick={() => setCollapsed(false)}>
        <span className="text-sm text-gray-600">
          [+] {author} ({score} points) - {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>
    )
  }

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-200/50 pl-4' : 'p-4'}`}>
      <div className="flex gap-2">
        {/* Vote buttons */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 hover:bg-yellow-100/50 rounded-full transition ${
              userVote === 1 ? 'text-yellow-200' : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-xs font-bold ${
            userVote === 1 ? 'text-yellow-200' : userVote === -1 ? 'text-blue-500' : 'text-gray-600'
          }`}>
            {score}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 hover:bg-blue-50 rounded-full transition ${
              userVote === -1 ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-4 h-4" fill={userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Comment content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <span className="font-semibold hover:underline cursor-pointer text-charcoal flex items-center gap-1">
              {authorType === 'doctor' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {author}
            </span>
            {verified && (
              <span className="px-2 py-0.5 bg-charcoal text-white rounded-full text-xs font-semibold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            )}
            <span className="text-gray-500">• {timeAgo}</span>
          </div>

          {/* Content */}
          <p className="text-sm text-gray-800 mb-2">{content}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <button
              onClick={() => setShowReply(!showReply)}
              className="font-semibold hover:bg-cream-50/50 px-2 py-1 rounded-full transition"
            >
              Reply
            </button>
            <button
              onClick={handleShare}
              className="hover:bg-cream-50/50 px-2 py-1 rounded-full transition"
            >
              Share
            </button>
            <button
              onClick={handleReport}
              className="hover:bg-cream-50/50 px-2 py-1 rounded-full transition"
            >
              Report
            </button>
            <button
              onClick={handleSave}
              className={`hover:bg-cream-50/50 px-2 py-1 rounded-full transition ${saved ? 'text-yellow-200 font-semibold' : ''}`}
            >
              {saved ? 'Saved' : 'Save'}
            </button>
            {replies.length > 0 && (
              <button
                onClick={() => setCollapsed(true)}
                className="hover:bg-cream-50/50 px-2 py-1 rounded-full transition"
              >
                [-] Collapse
              </button>
            )}
          </div>

          {/* Reply box */}
          {showReply && (
            <div className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="What are your thoughts?"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setShowReply(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-cream-50/50 rounded-full transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-charcoal text-white rounded-full hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft"
                >
                  Reply
                </button>
              </div>
            </div>
          )}

          {/* Nested replies */}
          {replies.length > 0 && (
            <div className="mt-3">
              {replies.map((reply) => (
                <Comment key={reply.id} {...reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}