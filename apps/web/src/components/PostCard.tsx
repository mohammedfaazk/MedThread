'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MessageCircle, Share2, Bookmark, EyeOff, MoreHorizontal, Stethoscope, User, Pin, CheckCircle } from 'lucide-react'
import { useStore } from '@/store/useStore'

interface PostCardProps {
  id: string
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  specialty?: string
  timeAgo: string
  title: string
  content: string
  tags: string[]
  upvotes: number
  downvotes: number
  score: number
  comments: number
  doctorReplies: number
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
  isPinned,
  userVote,
  isSaved,
  community
}: PostCardProps) {
  const { votePost, savePost, hidePost } = useStore()
  const router = useRouter()

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

  const handleCardClick = () => {
    router.push(`/post/${id}`)
  }

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white/40 backdrop-blur-md rounded-2xl hover:shadow-elevated transition-all duration-200 cursor-pointer overflow-hidden shadow-lg hover:scale-[1.01] border border-white/30"
    >
      <div className="flex">
        {/* Vote Section */}
        <div className="w-12 bg-cream-30 flex flex-col items-center py-3 rounded-l-xl">
          <button
            onClick={(e) => handleVote(e, 1)}
            className={`p-1.5 hover:bg-yellow-100 rounded-full transition ${
              userVote === 1 ? 'text-yellow-200' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-sm font-bold my-1 ${
            userVote === 1 ? 'text-yellow-200' : userVote === -1 ? 'text-blue-500' : 'text-charcoal'
          }`}>
            {score}
          </span>
          <button
            onClick={(e) => handleVote(e, -1)}
            className={`p-1.5 hover:bg-blue-50 rounded-full transition ${
              userVote === -1 ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <svg className="w-5 h-5" fill={userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2 flex-wrap">
            {isPinned && (
              <span className="px-3 py-1 bg-yellow-100 text-charcoal rounded-full font-semibold shadow-soft flex items-center gap-1">
                <Pin className="w-3 h-3" />
                Pinned
              </span>
            )}
            <Link 
              href={`/m/${community}`} 
              className="font-semibold hover:text-yellow-200 transition" 
              onClick={(e) => e.stopPropagation()}
            >
              m/{community}
            </Link>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">Posted by</span>
            <Link 
              href={`/u/${author}`} 
              className="font-semibold hover:text-yellow-200 transition flex items-center gap-1" 
              onClick={(e) => e.stopPropagation()}
            >
              {authorType === 'doctor' ? <Stethoscope className="w-3 h-3" /> : <User className="w-3 h-3" />}
              u/{author}
            </Link>
            {verified && (
              <span className="px-3 py-1 bg-charcoal text-white rounded-full font-semibold flex items-center gap-1 shadow-soft">
                <CheckCircle className="w-3 h-3" />
                Verified Doctor
              </span>
            )}
            {specialty && (
              <span className="text-gray-500">• {specialty}</span>
            )}
            <span className="text-gray-500">• {timeAgo}</span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold mb-2 text-charcoal hover:text-charcoal-light transition">
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
                className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-full text-xs font-medium text-charcoal transition shadow-soft"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <button className="flex items-center gap-1.5 hover:bg-cream-100 px-3 py-1.5 rounded-full transition" onClick={(e) => e.stopPropagation()}>
              <MessageCircle className="w-4 h-4" />
              <span className="font-semibold">{comments} Comments</span>
            </button>
            {doctorReplies > 0 && (
              <span className="flex items-center gap-1.5 text-orange-500 font-semibold px-3 py-1.5 bg-orange-50 rounded-full">
                <Stethoscope className="w-4 h-4" />
                {doctorReplies} Doctor {doctorReplies === 1 ? 'Reply' : 'Replies'}
              </span>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:bg-cream-100 px-3 py-1.5 rounded-full transition"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 hover:bg-cream-100 px-3 py-1.5 rounded-full transition ${
                isSaved ? 'text-yellow-200 font-semibold bg-yellow-50' : ''
              }`}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              onClick={handleHide}
              className="flex items-center gap-1.5 hover:bg-cream-100 px-3 py-1.5 rounded-full transition"
            >
              <EyeOff className="w-4 h-4" />
              <span>Hide</span>
            </button>
            <button className="flex items-center gap-1.5 hover:bg-cream-100 px-3 py-1.5 rounded-full transition" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}