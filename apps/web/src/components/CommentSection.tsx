'use client'

import { useState } from 'react'
import { Comment } from './Comment'
import { useUser } from '@/context/UserContext'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [sortBy, setSortBy] = useState<'best' | 'top' | 'new' | 'controversial'>('best')
  const [commentText, setCommentText] = useState('')

  // Mock comments data
  const comments = [
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
  ]

  const { user, role, loading: userLoading } = useUser()

  const handleComment = () => {
    if (!commentText.trim() || role !== 'VERIFIED_DOCTOR') return

    alert(`Comment posted: "${commentText}" (This will be saved to the database)`)
    setCommentText('')
  }

  if (userLoading) return <div className="p-4 text-gray-500">Loading comments...</div>

  return (
    <div className="bg-white rounded border border-gray-300">
      {/* Comment Input - Only for Doctors */}
      {role === 'VERIFIED_DOCTOR' ? (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Comment as <span className="text-blue-600 font-semibold">{user?.email}</span></p>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => setCommentText('')}
              className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-full"
            >
              Cancel
            </button>
            <button
              onClick={handleComment}
              disabled={!commentText.trim()}
              className="px-4 py-1.5 text-sm font-semibold bg-[#FF4500] text-white rounded-full hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500 italic">Only verified healthcare professionals can comment on posts.</p>
        </div>
      )}

      {/* Sort Options */}
      <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <button
          onClick={() => setSortBy('best')}
          className={`px-3 py-1 text-sm font-semibold rounded ${sortBy === 'best' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
        >
          Best
        </button>
        <button
          onClick={() => setSortBy('top')}
          className={`px-3 py-1 text-sm font-semibold rounded ${sortBy === 'top' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
        >
          Top
        </button>
        <button
          onClick={() => setSortBy('new')}
          className={`px-3 py-1 text-sm font-semibold rounded ${sortBy === 'new' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
        >
          New
        </button>
        <button
          onClick={() => setSortBy('controversial')}
          className={`px-3 py-1 text-sm font-semibold rounded ${sortBy === 'controversial' ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
        >
          Controversial
        </button>
      </div>

      {/* Comments */}
      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <Comment key={comment.id} {...comment} />
        ))}
      </div>
    </div>
  )
}