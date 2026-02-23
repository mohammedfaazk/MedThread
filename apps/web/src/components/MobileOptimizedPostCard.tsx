'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical } from 'lucide-react'
import { useTouchFeedback } from '@/hooks/useTouchFeedback'
import OptimizedImage from './OptimizedImage'

interface MobileOptimizedPostCardProps {
  post: {
    id: string
    title: string
    content: string
    author: {
      username: string
      avatar?: string
    }
    likes: number
    comments: number
    createdAt: string
  }
}

export function MobileOptimizedPostCard({ post }: MobileOptimizedPostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const { lightTap } = useTouchFeedback()

  const handleLike = () => {
    setIsLiked(!isLiked)
    lightTap()
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    lightTap()
  }

  return (
    <article className="bg-white rounded-2xl shadow-sm overflow-hidden touch-target">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Link href={`/u/${post.author.username}`} className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">
              {post.author.username}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </Link>
        <button className="p-2 hover:bg-gray-100 rounded-full touch-target">
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <Link href={`/post/${post.id}`} className="block px-4 pb-3">
        <h3 className="font-bold text-base mb-2 text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-700 line-clamp-3">
          {post.content}
        </p>
      </Link>

      {/* Actions */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors touch-target"
        >
          <Heart 
            className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
          />
          <span className="text-sm font-medium text-gray-700">
            {post.likes + (isLiked ? 1 : 0)}
          </span>
        </button>

        <Link
          href={`/post/${post.id}#comments`}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors touch-target"
        >
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            {post.comments}
          </span>
        </Link>

        <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors touch-target">
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors touch-target"
        >
          <Bookmark 
            className={`w-5 h-5 ${isSaved ? 'fill-blue-500 text-blue-500' : 'text-gray-600'}`}
          />
        </button>
      </div>
    </article>
  )
}
