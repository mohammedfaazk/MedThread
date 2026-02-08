'use client'

import { useState } from 'react'
import { Comment } from './Comment'

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

  const handleComment = () => {
    if (!commentText.trim()) return
    
    alert(`Comment posted: "${commentText}" (This will be saved to the database)`)
    setCommentText('')
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 mb-4 shadow-lg">
      {/* Comment Input */}
      <div className="p-4 border-b border-gray-200/50">
        <p className="text-sm text-gray-600 mb-2">Comment as <span className="text-charcoal font-semibold">guest</span></p>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="What are your thoughts?"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
          rows={4}
        />
        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={() => setCommentText('')}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-cream-50/50 rounded-full transition"
          >
            Cancel
          </button>
          <button
            onClick={handleComment}
            disabled={!commentText.trim()}
            className="px-4 py-2 text-sm font-semibold bg-charcoal text-white rounded-full hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft"
          >
            Comment
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="px-4 py-2 border-b border-gray-200/50 flex items-center gap-2">
        <button
          onClick={() => setSortBy('best')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
            sortBy === 'best' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          Best
        </button>
        <button
          onClick={() => setSortBy('top')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
            sortBy === 'top' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          Top
        </button>
        <button
          onClick={() => setSortBy('new')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
            sortBy === 'new' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          New
        </button>
        <button
          onClick={() => setSortBy('controversial')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-full transition ${
            sortBy === 'controversial' ? 'bg-yellow-100 text-charcoal' : 'hover:bg-cream-50/50 text-charcoal'
          }`}
        >
          Controversial
        </button>
      </div>

      {/* Comments */}
      <div className="divide-y divide-gray-200/50">
        {comments.map((comment) => (
          <Comment key={comment.id} {...comment} />
        ))}
      </div>
    </div>
  )
}