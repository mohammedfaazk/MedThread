'use client'

import { useStore } from '@/store/useStore'
import Link from 'next/link'

interface PostCardProps {
  id: string
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  specialty?: string
  timeAgo: string
  title: string
  content?: string
  tags: string[]
  upvotes: number
  downvotes: number
  score: number
  comments: number
  doctorReplies: number
  severity?: 'low' | 'moderate' | 'high'
  isPinned?: boolean
  userVote?: 1 | -1 | null
  isSaved?: boolean
  community: string
}

export function PostCard({
  id,
  author,
  authorType,
  verified,
  specialty,
  timeAgo,
  title,
  content,
  tags,
  score,
  comments,
  doctorReplies,
  severity,
  isPinned,
  userVote,
  isSaved,
  community
}: PostCardProps) {
  const { votePost, savePost, hidePost } = useStore()

  const severityColors = {
    low: 'bg-green-100 text-green-700 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    high: 'bg-red-100 text-red-700 border-red-300'
  }

  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.preventDefault()
    e.stopPropagation()
    votePost(id, value)
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    savePost(id)
  }

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    hidePost(id)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`)
    alert('Link copied to clipboard!')
  }

  return (
    <Link href={`/post/${id}`}>
      <div className="bg-white rounded border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
        <div className="flex">
          {/* Vote Section */}
          <div className="w-10 bg-gray-50 flex flex-col items-center py-2 rounded-l">
            <button
              onClick={(e) => handleVote(e, 1)}
              className={`p-1 hover:bg-gray-200 rounded ${userVote === 1 ? 'text-[#FF4500]' : 'text-gray-400'
                }`}
            >
              <svg className="w-5 h-5" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-xs font-bold my-1 ${userVote === 1 ? 'text-[#FF4500]' : userVote === -1 ? 'text-[#7193ff]' : ''
              }`}>
              {score}
            </span>
            <button
              onClick={(e) => handleVote(e, -1)}
              className={`p-1 hover:bg-gray-200 rounded ${userVote === -1 ? 'text-[#7193ff]' : 'text-gray-400'
                }`}
            >
              <svg className="w-5 h-5" fill={userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-3">
            {/* Header */}
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              {isPinned && (
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold">
                  📌 Pinned
                </span>
              )}
              <Link href={`/r/${community}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                r/{community}
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">Posted by</span>
              <Link href={`/u/${author}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                {authorType === 'doctor' ? '👨‍⚕️' : '👤'} u/{author}
              </Link>
              {verified && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold flex items-center gap-1">
                  ✓ Verified Doctor
                </span>
              )}
              {specialty && (
                <span className="text-gray-500">• {specialty}</span>
              )}
              <span className="text-gray-500">• {timeAgo}</span>
              {severity && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColors[severity]}`}>
                  {severity.toUpperCase()}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-semibold mb-2 hover:text-blue-600">
              {title}
            </h2>

            {/* Content Preview */}
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {content}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded" onClick={(e) => e.stopPropagation()}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-semibold">{comments} Comments</span>
              </button>
              {doctorReplies > 0 && (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  👨‍⚕️ {doctorReplies} Doctor {doctorReplies === 1 ? 'Reply' : 'Replies'}
                </span>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded ${isSaved ? 'text-[#FF4500] font-semibold' : ''
                  }`}
              >
                <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleHide}
                className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span>Hide</span>
              </button>
              <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded" onClick={(e) => e.stopPropagation()}>
                <span>⋯</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}