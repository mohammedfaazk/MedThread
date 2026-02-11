'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { useRouter } from 'next/navigation'
import { FileText, Image, Link2, BarChart3, Bold, Italic, List } from 'lucide-react'

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-elevated border border-white/20">
        {/* Header */}
        <div className="border-b border-gray-200/50 p-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
          <h2 className="text-lg font-semibold text-charcoal">Create a post</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-charcoal transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          {/* Community Selector */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-charcoal">Choose a community</label>
            <select
              value={community}
              onChange={(e) => setCommunity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
            >
              <option value="general">m/general - General Health</option>
              <option value="cardiology">m/cardiology - Cardiology</option>
              <option value="neurology">m/neurology - Neurology</option>
              <option value="pediatrics">m/pediatrics - Pediatrics</option>
              <option value="mental-health">m/mental-health - Mental Health</option>
            </select>
          </div>

          {/* Post Type Tabs */}
          <div className="flex gap-2 mb-4 border-b border-gray-200/50">
            <button
              onClick={() => setPostType('text')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${
                postType === 'text'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              Text
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${
                postType === 'image'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
              }`}
            >
              <Image className="w-4 h-4" />
              Image
            </button>
            <button
              onClick={() => setPostType('link')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${
                postType === 'link'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Link
            </button>
            <button
              onClick={() => setPostType('poll')}
              className={`px-4 py-2 font-medium rounded-t-xl transition flex items-center gap-2 ${
                postType === 'poll'
                  ? 'bg-yellow-100 text-charcoal'
                  : 'text-gray-600 hover:bg-cream-50/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Poll
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
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
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
              <div className="flex gap-2 mt-2">
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Bold">
                  <Bold className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Italic">
                  <Italic className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="Link">
                  <Link2 className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-cream-50/50 rounded-lg transition" title="List">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {postType === 'image' && (
            <div className="mb-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-cream-50/30">
                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600 mb-2">Drag and drop images or</p>
                <button className="px-4 py-2 bg-cyan-500 text-white rounded-full hover:bg-cyan-600 transition shadow-soft">
                  Upload
                </button>
              </div>
            </div>
          )}

          {/* Flair */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-charcoal">Flair (optional)</label>
            <select
              value={flair}
              onChange={(e) => setFlair(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
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
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-charcoal">Mark as NSFW</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-charcoal">Mark as spoiler</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200/50">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full font-semibold hover:bg-cream-50/50 text-charcoal transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!title.trim()}
              className="flex-1 px-4 py-2.5 bg-charcoal text-white rounded-full font-semibold hover:bg-charcoal-light disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft hover:shadow-elevated"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}