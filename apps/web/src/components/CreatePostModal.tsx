'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
  const [postType, setPostType] = useState<'text' | 'image' | 'link' | 'poll'>('text')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [community, setCommunity] = useState('general')
  const [flair, setFlair] = useState('')
  const [isNSFW, setIsNSFW] = useState(false)
  const [isSpoiler, setIsSpoiler] = useState(false)
  const { setPosts, posts } = useStore()
  const router = useRouter()

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a title')
      return
    }

    const newPost = {
      id: `post_${Date.now()}`,
      type: postType,
      author: 'current_user',
      authorType: 'patient' as const,
      community,
      timeAgo: 'just now',
      title,
      content,
      tags: flair ? [flair] : [],
      upvotes: 1,
      downvotes: 0,
      score: 1,
      comments: 0,
      doctorReplies: 0,
      userVote: 1 as const,
      isSaved: false,
      isHidden: false,
      isNSFW,
      isSpoiler
    }

    setPosts([newPost, ...posts])
    
    // Reset form
    setTitle('')
    setContent('')
    setFlair('')
    setIsNSFW(false)
    setIsSpoiler(false)
    
    onClose()
    
    // Navigate to the new post
    router.push(`/post/${newPost.id}`)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-300 p-4 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-lg font-semibold">Create a post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Community Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Choose a community</label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="general">r/general - General Health</option>
              <option value="cardiology">r/cardiology - Cardiology</option>
              <option value="neurology">r/neurology - Neurology</option>
              <option value="pediatrics">r/pediatrics - Pediatrics</option>
              <option value="mental-health">r/mental-health - Mental Health</option>
            </select>
          </div>

          {/* Post Type Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-300">
            <button
              onClick={() => setPostType('text')}
              className={`px-4 py-2 font-medium ${
                postType === 'text'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📝 Text
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`px-4 py-2 font-medium ${
                postType === 'image'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🖼️ Image
            </button>
            <button
              onClick={() => setPostType('link')}
              className={`px-4 py-2 font-medium ${
                postType === 'link'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔗 Link
            </button>
            <button
              onClick={() => setPostType('poll')}
              className={`px-4 py-2 font-medium ${
                postType === 'poll'
                  ? 'border-b-2 border-blue-500 text-blue-500'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Poll
            </button>
          </div>

          {/* Title */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={300}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
            <div className="text-xs text-gray-500 mt-1">{title.length}/300</div>
          </div>

          {/* Content based on type */}
          {postType === 'text' && (
            <div className="mb-4">
              <textarea
                placeholder="Text (optional)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="flex gap-2 mt-2">
                <button className="p-2 hover:bg-gray-100 rounded" title="Bold">
                  <strong>B</strong>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded" title="Italic">
                  <em>I</em>
                </button>
                <button className="p-2 hover:bg-gray-100 rounded" title="Link">
                  🔗
                </button>
                <button className="p-2 hover:bg-gray-100 rounded" title="List">
                  ≡
                </button>
              </div>
            </div>
          )}

          {postType === 'image' && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">Drag and drop images or</p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Upload
                </button>
              </div>
            </div>
          )}

          {/* Flair */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Flair (optional)</label>
            <select
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            >
              <option value="">No flair</option>
              <option value="Question">Question</option>
              <option value="Discussion">Discussion</option>
              <option value="Advice">Seeking Advice</option>
              <option value="Update">Update</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Options */}
          <div className="mb-4 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNSFW}
                onChange={(e) => setIsNSFW(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Mark as NSFW</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Mark as spoiler</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-300">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}