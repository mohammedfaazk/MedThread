'use client'

import { useStore } from '@/store/useStore'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { User, Stethoscope, CheckCircle, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PostDetailProps {
  postId: string
}

interface Post {
  id: string
  type: 'text' | 'image' | 'video' | 'link' | 'poll' | 'gallery'
  title: string
  content?: string
  url?: string
  mediaUrls?: string[]
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  specialty?: string
  community: string
  timeAgo: string
  upvotes: number
  downvotes: number
  score: number
  comments: number
  doctorReplies: number
  tags: string[]
  flair?: string
  isPinned?: boolean
  isNSFW?: boolean
  isSpoiler?: boolean
  isLocked?: boolean
  isArchived?: boolean
  userVote?: 1 | -1 | null
  isSaved?: boolean
  isHidden?: boolean
}

export function PostDetail({ postId }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const { votePost, savePost } = useStore()
  const { user } = useJWTAuth()
  const router = useRouter()
  
  const isAuthor = user?.username === post?.author
  
  // Fetch post from API
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`${API_URL}/api/v1/posts/${postId}`)
        const apiPost = response.data
        
        // Transform API post to match our Post interface
        const transformedPost: Post = {
          id: apiPost.id,
          type: apiPost.type?.toLowerCase() || 'text',
          title: apiPost.title,
          content: apiPost.content,
          url: apiPost.url,
          mediaUrls: apiPost.mediaUrls || [],
          author: apiPost.author?.username || 'Unknown',
          authorType: (apiPost.author?.role === 'VERIFIED_DOCTOR' || apiPost.author?.role === 'DOCTOR') ? 'doctor' : 'patient',
          verified: apiPost.author?.role === 'VERIFIED_DOCTOR' || (apiPost.author?.role === 'DOCTOR' && apiPost.author?.doctorVerificationStatus === 'APPROVED'),
          specialty: apiPost.author?.specialty,
          community: apiPost.community?.name || 'general',
          timeAgo: getTimeAgo(apiPost.createdAt),
          upvotes: apiPost.upvotes || 0,
          downvotes: apiPost.downvotes || 0,
          score: apiPost.score || 0,
          comments: apiPost.commentCount || 0,
          doctorReplies: 0,
          tags: [],
          flair: apiPost.flair?.text,
          isPinned: apiPost.isPinned,
          isNSFW: apiPost.isNSFW,
          isSpoiler: apiPost.isSpoiler,
          isLocked: apiPost.isLocked,
          isArchived: apiPost.isArchived,
          userVote: apiPost.userVote || null,
          isSaved: apiPost.isSaved || false,
          isHidden: apiPost.isHidden || false,
        }
        
        setPost(transformedPost)
        setEditTitle(transformedPost.title)
        setEditContent(transformedPost.content || '')
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [postId])

  const getTimeAgo = (date: Date | string): string => {
    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  }

  if (loading || !post) {
    return (
      <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center shadow-lg">
        <p className="text-gray-500">Loading post...</p>
      </div>
    )
  }

  const handleVote = async (value: 1 | -1) => {
    const token = localStorage.getItem('auth_token')
    await votePost(postId, value, token || undefined)
    
    // Update local state optimistically
    setPost(prev => {
      if (!prev) return prev
      const oldVote = prev.userVote || 0
      const newVote = prev.userVote === value ? 0 : value
      const scoreDiff = newVote - oldVote
      
      return {
        ...prev,
        userVote: newVote === 0 ? null : newVote,
        score: prev.score + scoreDiff,
        upvotes: newVote === 1 ? prev.upvotes + 1 : prev.upvotes - (oldVote === 1 ? 1 : 0),
        downvotes: newVote === -1 ? prev.downvotes + 1 : prev.downvotes - (oldVote === -1 ? 1 : 0)
      }
    })
  }

  const handleSave = async () => {
    const token = localStorage.getItem('auth_token')
    await savePost(postId, token || undefined)
    
    // Update local state
    setPost(prev => prev ? { ...prev, isSaved: !prev.isSaved } : prev)
  }

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      alert('Title cannot be empty')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to edit posts')
        return
      }

      await axios.put(
        `${API_URL}/api/v1/posts/${postId}`,
        {
          title: editTitle,
          content: editContent
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert('Post updated successfully!')
      setIsEditing(false)
      // Refresh post data
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to edit post:', error)
      alert(error.response?.data?.error || 'Failed to edit post')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to delete posts')
        return
      }

      await axios.delete(`${API_URL}/api/v1/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Post deleted successfully!')
      router.push('/')
    } catch (error: any) {
      console.error('Failed to delete post:', error)
      alert(error.response?.data?.error || 'Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditTitle(post?.title || '')
    setEditContent(post?.content || '')
  }

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-lg hover:shadow-xl transition-all">
      <div className="flex">
        {/* Vote Section */}
        <div className="w-10 bg-cyan-500/5 backdrop-blur-sm flex flex-col items-center py-4 rounded-l-2xl border-r border-cyan-200/30">
          <button
            onClick={() => handleVote(1)}
            className={`p-1 hover:bg-cyan-100/30 rounded-lg transition-all ${
              post.userVote === 1 ? 'text-[#FF4500]' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill={post.userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          <span className={`text-sm font-bold my-2 ${
            post.userVote === 1 ? 'text-[#FF4500]' : post.userVote === -1 ? 'text-[#7193ff]' : 'text-gray-700'
          }`}>
            {post.score}
          </span>
          <button
            onClick={() => handleVote(-1)}
            className={`p-1 hover:bg-cyan-100/30 rounded-lg transition-all ${
              post.userVote === -1 ? 'text-[#7193ff]' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6" fill={post.userVote === -1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold hover:underline cursor-pointer flex items-center gap-1">
                {post.authorType === 'doctor' ? <Stethoscope className="w-4 h-4" /> : <User className="w-4 h-4" />}
                {post.author}
              </span>
              {post.verified && (
                <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified Doctor
                </span>
              )}
              <span className="text-gray-500">• {post.timeAgo}</span>
            </div>

            {/* Author Actions Menu */}
            {isAuthor && !isEditing && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-100 rounded-full transition"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[120px]">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          {isEditing ? (
            <div className="mb-4">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-2xl font-bold focus:outline-none focus:border-blue-400"
                placeholder="Post title"
              />
            </div>
          ) : (
            <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
          )}

          {/* Text Content */}
          {post.type === 'text' && (
            <>
              {isEditing ? (
                <div className="mb-4">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-base focus:outline-none focus:border-blue-400 resize-none"
                    rows={8}
                    placeholder="Post content (optional)"
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleEdit}
                      className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : post.content ? (
                <div className="prose max-w-none mb-4">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                </div>
              ) : null}
            </>
          )}

          {/* Image Content */}
          {post.type === 'image' && post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mb-4">
              <div className={`grid gap-3 ${post.mediaUrls.length === 1 ? 'grid-cols-1' : post.mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                {post.mediaUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="w-full h-auto object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
              {post.content && (
                <div className="prose max-w-none mt-4">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>
              )}
            </div>
          )}

          {/* Video Content */}
          {post.type === 'video' && post.mediaUrls && post.mediaUrls.length > 0 && (
            <div className="mb-4">
              <video
                src={post.mediaUrls[0]}
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: '500px' }}
              />
              {post.content && (
                <div className="prose max-w-none mt-4">
                  <p className="text-gray-800 leading-relaxed">{post.content}</p>
                </div>
              )}
            </div>
          )}

          {/* Link Content */}
          {post.type === 'link' && post.url && (
            <div className="mb-4">
              <a
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition"
              >
                <div className="flex items-center gap-2 text-blue-600 font-medium mb-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="text-lg">{new URL(post.url).hostname}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{post.url}</p>
                {post.content && (
                  <p className="text-gray-800">{post.content}</p>
                )}
              </a>
            </div>
          )}

          {/* Poll Content */}
          {post.type === 'poll' && post.content && (
            <div className="mb-4">
              {(() => {
                try {
                  const pollData = JSON.parse(post.content)
                  return (
                    <div className="space-y-3">
                      {pollData.options?.map((option: string, index: number) => (
                        <div
                          key={index}
                          className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
                            <span className="text-gray-800 font-medium">{option}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-2">
                        <span className="font-semibold">{pollData.totalVotes || 0} votes</span>
                        <span>•</span>
                        <span>{pollData.duration} days remaining</span>
                      </div>
                    </div>
                  )
                } catch {
                  return (
                    <div className="prose max-w-none">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    </div>
                  )
                }
              })()}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t border-neutral-400/20">
            <button className="flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-semibold">{post.comments} Comments</span>
            </button>
            <button className="flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 hover:bg-neutral-300/20 px-3 py-2 rounded-xl transition-all ${
                post.isSaved ? 'text-[#FF4500] font-semibold' : ''
              }`}
            >
              <svg className="w-5 h-5" fill={post.isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>{post.isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}