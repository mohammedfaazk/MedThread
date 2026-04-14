'use client'

import { useStore } from '@/store/useStore'
import { useJWTAuth } from '@/context/JWTAuthContext'
import Link from 'next/link'
import { UserRound, Stethoscope, Pin, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import dynamic from 'next/dynamic'
import { analytics } from '@/lib/analytics'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useClickSpark } from '@/hooks/useClickSpark'

const AwardButton = dynamic(() => import('./AwardButton').then(m => ({ default: m.AwardButton })), { ssr: false })
const AwardDisplay = dynamic(() => import('./AwardDisplay').then(m => ({ default: m.AwardDisplay })), { ssr: false })
const ReportButton = dynamic(() => import('./ReportButton'), { ssr: false })
const PostPriorityBadge = dynamic(() => import('./feed/PostPriorityBadge').then(m => ({ default: m.PostPriorityBadge })), { ssr: false })
const SpotlightCard = dynamic(() => import('./enhancements/SpotlightCard'), { ssr: false })

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PostCardProps {
  id: string
  type?: 'text' | 'image' | 'video' | 'link' | 'poll' | 'gallery'
  author: string
  authorType: 'patient' | 'doctor'
  verified?: boolean
  specialty?: string
  timeAgo: string
  title: string
  content?: string
  url?: string
  mediaUrls?: string[]
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
  editedAt?: string | null
  // Priority system props
  urgencyScore?: number
  priorityLevel?: 'HIGH' | 'MEDIUM' | 'LOW'
  detectedSymptoms?: Array<{
    symptom: string
    weight: number
    category: string
  }>
  // Endorsement
  endorsementCount?: number
  userEndorsed?: boolean
}

export function PostCard({
  id,
  type = 'text',
  author,
  authorType,
  verified,
  specialty,
  timeAgo,
  title,
  content,
  url,
  mediaUrls = [],
  tags,
  score,
  comments,
  doctorReplies,
  severity,
  isPinned,
  userVote,
  isSaved,
  community,
  editedAt,
  urgencyScore = 0,
  priorityLevel = 'LOW',
  detectedSymptoms = [],
  endorsementCount = 0,
  userEndorsed = false,
}: PostCardProps) {
  const { votePost, savePost, hidePost } = useStore()
  const { user, role } = useJWTAuth()
  const [postAwards, setPostAwards] = useState<any[]>([])
  const [awardsLoading, setAwardsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)
  const [editContent, setEditContent] = useState(content || '')
  const [isDeleting, setIsDeleting] = useState(false)
  const [endorsed, setEndorsed] = useState(userEndorsed)
  const [endorseCount, setEndorseCount] = useState(endorsementCount)
  const [endorsing, setEndorsing] = useState(false)

  const isAuthor = user?.username === author
  const { triggerSpark, ClickSparkComponent } = useClickSpark()

  const handleEndorse = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (endorsing) return
    const token = localStorage.getItem('auth_token')
    if (!token) return
    setEndorsing(true)
    // Optimistic update
    const wasEndorsed = endorsed
    setEndorsed(!wasEndorsed)
    setEndorseCount(c => wasEndorsed ? c - 1 : c + 1)
    try {
      await axios.post(
        `${API_URL}/api/v1/posts/${id}/endorse`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch {
      // Revert on error
      setEndorsed(wasEndorsed)
      setEndorseCount(c => wasEndorsed ? c + 1 : c - 1)
    } finally {
      setEndorsing(false)
    }
  }

  useEffect(() => {
    fetchPostAwards()
  }, [id])

  const fetchPostAwards = async () => {
    setAwardsLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/v1/awards/post/${id}`)
      if (response.data.success && response.data.data.awards) {
        setPostAwards(response.data.data.awards)
      }
    } catch (error) {
      console.error('Failed to fetch post awards:', error)
    } finally {
      setAwardsLoading(false)
    }
  }

  // Debug logging
  if (authorType === 'doctor') {
    console.log('Doctor post:', { author, authorType, verified, specialty })
  }

  // Track post view
  useEffect(() => {
    analytics.trackPostView(id);
  }, [id]);

  const severityColors = {
    low: 'bg-green-100 text-green-700 border-green-300',
    moderate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    high: 'bg-red-100 text-red-700 border-red-300'
  }

  const priorityBorderColors = {
    HIGH: 'border-l-4 border-l-red-500',
    MEDIUM: 'border-l-4 border-l-amber-500',
    LOW: 'border-l-4 border-l-green-500'
  }

  const handleVote = (e: React.MouseEvent, value: 1 | -1) => {
    e.preventDefault()
    e.stopPropagation()
    triggerSpark(e)
    const token = localStorage.getItem('auth_token')
    votePost(id, value, token || undefined)
    analytics.trackEvent('post_vote', 'engagement', { postId: id, vote: value })
  }

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const token = localStorage.getItem('auth_token')
    savePost(id, token || undefined)
    analytics.trackEvent('post_save', 'engagement', { postId: id })
  }

  const handleHide = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const token = localStorage.getItem('auth_token')
    hidePost(id, token || undefined)
    analytics.trackEvent('post_hide', 'engagement', { postId: id })
  }

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/post/${id}`)
    alert('Link copied to clipboard!')
    analytics.trackShare('post', id, 'clipboard')
  }

  const handleFixPriority = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Re-analyze priority for this post? This will update the priority based on current content.')) {
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please login to fix priority')
        return
      }

      const response = await axios.post(
        `${API_URL}/api/fix-priorities/post/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.data.success) {
        alert(`Priority updated to ${response.data.data.analysis.priorityLevel} (score: ${response.data.data.analysis.urgencyScore})`)
        window.location.reload()
      }
    } catch (error: any) {
      console.error('Failed to fix priority:', error)
      alert(error.response?.data?.error || 'Failed to fix priority')
    }
  }

  const handleCardClick = () => {
    if (!isEditing) {
      window.location.href = `/post/${id}`
    }
  }

  const handleEdit = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
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
        `${API_URL}/api/v1/posts/${id}`,
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
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to edit post:', error)
      alert(error.response?.data?.error || 'Failed to edit post')
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

      await axios.delete(`${API_URL}/api/v1/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      alert('Post deleted successfully!')
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to delete post:', error)
      alert(error.response?.data?.error || 'Failed to delete post')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(false)
    setEditTitle(title)
    setEditContent(content || '')
  }

  return (
    <SpotlightCard>
      <div 
        onClick={handleCardClick}
        className={`bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 hover:border-white/40 transition-all cursor-pointer shadow-lg hover:shadow-xl ${priorityBorderColors[priorityLevel] || ''}`}
      >
        {ClickSparkComponent}
        <div className="flex">
          {/* Vote Section */}
          <div className="w-10 bg-cyan-500/5 backdrop-blur-sm flex flex-col items-center py-2 rounded-l-2xl border-r border-cyan-200/30">
            <button
              onClick={(e) => handleVote(e, 1)}
              className={`p-1 hover:bg-cyan-100/30 rounded-lg transition-all ${userVote === 1 ? 'text-[#FF4500]' : 'text-gray-600'
                }`}
            >
              <svg className="w-5 h-5" fill={userVote === 1 ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <span className={`text-xs font-bold my-1 ${userVote === 1 ? 'text-[#FF4500]' : userVote === -1 ? 'text-[#7193ff]' : 'text-gray-700'
              }`}>
              {score}
            </span>
            <button
              onClick={(e) => handleVote(e, -1)}
              className={`p-1 hover:bg-cyan-100/30 rounded-lg transition-all ${userVote === -1 ? 'text-[#7193ff]' : 'text-gray-600'
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
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 flex-wrap">
                {isPinned && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold flex items-center gap-1">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                <Link href={`/m/${community}`} className="font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
                  m/{community}
                </Link>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">Posted by</span>
                <Link href={`/u/${author}`} className="font-semibold hover:underline flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {authorType === 'doctor' ? <Stethoscope className="w-3 h-3" /> : <UserRound className="w-3 h-3" />}
                  u/{author}
                </Link>
                {verified && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-bold flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Doctor
                  </span>
                )}
                {specialty && (
                  <span className="text-gray-500">• {specialty}</span>
                )}
                <span className="text-gray-500">• {timeAgo}</span>
                {editedAt && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 italic">edited</span>
                  </>
                )}
                {severity && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${severityColors[severity]}`}>
                    {severity.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Author Actions Menu */}
              {isAuthor && !isEditing && (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowMenu(!showMenu)
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full transition"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsEditing(true)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          handleFixPriority(e)
                          setShowMenu(false)
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Fix Priority
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

            {/* Priority Badge - Show on ALL posts */}
            {(
              <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                <PostPriorityBadge
                  priority={priorityLevel}
                  urgencyScore={urgencyScore}
                  detectedSymptoms={detectedSymptoms}
                  showDetails={false}
                />
              </div>
            )}

            {/* Title */}
            {isEditing ? (
              <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-400"
                  placeholder="Post title"
                />
              </div>
            ) : (
              <h2 className="text-lg font-semibold mb-2 hover:text-blue-600">
                {title}
              </h2>
            )}

            {/* Content Preview */}
            {content && type === 'text' && (
              <>
                {isEditing ? (
                  <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-400 resize-none"
                      rows={4}
                      placeholder="Post content (optional)"
                    />
                    <div className="flex justify-end gap-2 mt-2">
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
                ) : (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {content}
                  </p>
                )}
              </>
            )}

            {/* Image Preview */}
            {type === 'image' && mediaUrls && mediaUrls.length > 0 && (
              <div className="mb-3">
                <div className={`grid gap-2 ${mediaUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {mediaUrls.slice(0, 4).map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ))}
                </div>
                {mediaUrls.length > 4 && (
                  <p className="text-xs text-gray-500 mt-2">+{mediaUrls.length - 4} more images</p>
                )}
                {content && (
                  <p className="text-sm text-gray-700 mt-2">{content}</p>
                )}
              </div>
            )}

            {/* Video Preview */}
            {type === 'video' && mediaUrls && mediaUrls.length > 0 && (
              <div className="mb-3">
                <video
                  src={mediaUrls[0]}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: '300px' }}
                  onClick={(e) => e.stopPropagation()}
                />
                {content && (
                  <p className="text-sm text-gray-700 mt-2">{content}</p>
                )}
              </div>
            )}

            {/* Link Preview */}
            {type === 'link' && url && (
              <div className="mb-3">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mb-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {new URL(url).hostname}
                  </div>
                  {content && (
                    <p className="text-sm text-gray-700">{content}</p>
                  )}
                </a>
              </div>
            )}

            {/* Poll Preview */}
            {type === 'poll' && content && (
              <div className="mb-3">
                {(() => {
                  try {
                    const pollData = JSON.parse(content)
                    return (
                      <div className="space-y-2">
                        {pollData.options?.map((option: string, index: number) => (
                          <div key={index} className="p-2 border border-gray-200 rounded-lg text-sm">
                            {option}
                          </div>
                        ))}
                        <p className="text-xs text-gray-500">
                          {pollData.totalVotes || 0} votes • {pollData.duration} days
                        </p>
                      </div>
                    )
                  } catch {
                    return null
                  }
                })()}
              </div>
            )}

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

            {/* Awards Display */}
            {postAwards.length > 0 && (
              <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                <AwardDisplay awards={postAwards} size="small" />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <Link 
                href={`/post/${id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 hover:bg-neutral-300/20 px-2 py-1 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-semibold">{comments} Comments</span>
              </Link>
              <div onClick={(e) => e.stopPropagation()}>
                <AwardButton postId={id} currentAwards={postAwards} onAwardGiven={fetchPostAwards} />
              </div>
              {doctorReplies > 0 && (
                <span className="flex items-center gap-1 text-blue-600 font-semibold">
                  <Stethoscope className="w-4 h-4" />
                  {doctorReplies} Doctor {doctorReplies === 1 ? 'Reply' : 'Replies'}
                </span>
              )}
              {/* Endorsement badge - visible to all */}
              {endorseCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {endorseCount} Doctor {endorseCount === 1 ? 'Endorsement' : 'Endorsements'}
                </span>
              )}
              {/* Endorse button - doctors only, on doctor posts, not own post */}
              {(role === 'DOCTOR' || role === 'VERIFIED_DOCTOR') && authorType === 'doctor' && !isAuthor && (
                <button
                  onClick={handleEndorse}
                  disabled={endorsing}
                  title={endorsed ? 'Remove endorsement' : 'Endorse this post'}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all text-xs font-semibold ${
                    endorsed
                      ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-gray-500 hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={endorsed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={endorsed ? 0 : 1.5} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {endorsed ? 'Endorsed' : 'Endorse'}
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex items-center gap-1 hover:bg-neutral-300/20 px-2 py-1 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              <button
                onClick={handleSave}
                className={`flex items-center gap-1 hover:bg-neutral-300/20 px-2 py-1 rounded-lg transition-all ${isSaved ? 'text-[#FF4500] font-semibold' : ''
                  }`}
              >
                <svg className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              <button
                onClick={handleHide}
                className="flex items-center gap-1 hover:bg-neutral-300/20 px-2 py-1 rounded-lg transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
                <span>Hide</span>
              </button>
              {/* Only show report button if not the author */}
              {!isAuthor && (
                <ReportButton 
                  type="post" 
                  targetId={id} 
                  targetTitle={title}
                  className="hover:bg-neutral-300/20 px-2 py-1 rounded-lg transition-all"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </SpotlightCard>
  )
}