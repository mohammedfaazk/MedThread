'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Heart, MessageCircle, ArrowLeft, Calendar, Clock } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Comment {
  id: string
  content: string
  author: {
    username: string
    role: string
  }
  createdAt: string
}

interface Story {
  id: string
  title: string
  story: string
  condition: string
  treatment?: string
  duration?: string
  beforePhotos?: string[]
  afterPhotos?: string[]
  likes: number
  views: number
  isVerified: boolean
  author: {
    id: string
    username: string
    avatar?: string
  }
  comments: Comment[]
  createdAt: string
}

export default function StoryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useJWTAuth()
  const [story, setStory] = useState<Story | null>(null)
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchStory()
    }
  }, [params.id])

  const fetchStory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/success-stories/${params.id}`)
      const data = await response.json()
      
      if (data.success) {
        setStory(data.data)
      }
    } catch (error) {
      console.error('Error fetching story:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`${API_URL}/api/v1/success-stories/${params.id}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStory()
    } catch (error) {
      console.error('Error liking story:', error)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/v1/success-stories/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      })

      if (response.ok) {
        setComment('')
        fetchStory()
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <IridescenceLayout>
        <NavbarEnhanced />
        <div className="max-w-[1440px] mx-auto flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          </main>
        </div>
      </IridescenceLayout>
    )
  }

  if (!story) {
    return (
      <IridescenceLayout>
        <NavbarEnhanced />
        <div className="max-w-[1440px] mx-auto flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Story not found</p>
            </div>
          </main>
        </div>
      </IridescenceLayout>
    )
  }

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1440px] mx-auto flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stories
          </button>

          {/* Story Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
            {/* Author Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {story.author.username[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900">{story.author.username}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(story.createdAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {story.views} views
                  </span>
                </div>
              </div>
              <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold">
                {story.condition}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{story.title}</h1>

            {/* Story Content */}
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">{story.story}</p>
            </div>

            {/* Treatment Info */}
            {(story.treatment || story.duration) && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Treatment Details</h3>
                {story.treatment && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Treatment:</span> {story.treatment}
                  </p>
                )}
                {story.duration && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Duration:</span> {story.duration}
                  </p>
                )}
              </div>
            )}

            {/* Photos */}
            {(story.beforePhotos?.length || story.afterPhotos?.length) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {story.beforePhotos && story.beforePhotos.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">Before</h3>
                    <div className="space-y-3">
                      {story.beforePhotos.map((photo, idx) => (
                        <img key={idx} src={photo} alt="Before" className="w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
                {story.afterPhotos && story.afterPhotos.length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-3">After</h3>
                    <div className="space-y-3">
                      {story.afterPhotos.map((photo, idx) => (
                        <img key={idx} src={photo} alt="After" className="w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleLike}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
              >
                <Heart className="w-6 h-6" />
                <span className="font-semibold text-lg">{story.likes}</span>
              </button>
              <div className="flex items-center gap-2 text-gray-600">
                <MessageCircle className="w-6 h-6" />
                <span className="font-semibold text-lg">{story.comments.length}</span>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({story.comments.length})
            </h2>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-8">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts or encouragement..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none mb-3"
                />
                <button
                  type="submit"
                  disabled={submitting || !comment.trim()}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-semibold transition"
                >
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {story.comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                story.comments.map(comment => (
                  <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                        {comment.author.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comment.author.username}</span>
                          {comment.author.role === 'DOCTOR' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                              Doctor
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </IridescenceLayout>
  )
}
