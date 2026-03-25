'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Heart, ThumbsUp, MessageCircle, Plus, Trophy, Search } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Story {
  id: string
  title: string
  story: string
  condition: string
  beforePhoto?: string
  afterPhoto?: string
  likes: number
  commentCount: number
  author: {
    username: string
    avatar?: string
  }
  createdAt: string
}

export default function SuccessStoriesPage() {
  const { user } = useJWTAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCondition, setFilterCondition] = useState('')
  const [showShareForm, setShowShareForm] = useState(false)

  useEffect(() => {
    fetchStories()
  }, [filterCondition])

  const fetchStories = async () => {
    try {
      const params = new URLSearchParams()
      if (filterCondition) params.append('condition', filterCondition)
      
      const response = await fetch(`${API_URL}/api/v1/success-stories?${params}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // API returns { stories, pagination }
        setStories(data.data.stories || [])
      } else {
        setStories([])
      }
    } catch (error) {
      console.error('Error fetching stories:', error)
      setStories([])
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (storyId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`${API_URL}/api/v1/success-stories/${storyId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchStories()
    } catch (error) {
      console.error('Error liking story:', error)
    }
  }

  const conditions = ['Diabetes', 'Hypertension', 'Weight Loss', 'Mental Health', 'Heart Disease', 'Cancer']

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

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1440px] mx-auto flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Success Stories
                </h1>
                <p className="text-gray-600">Inspiring health journeys from our community</p>
              </div>
              <button
                onClick={() => setShowShareForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition font-semibold shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Share Your Story
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterCondition('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !filterCondition ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Stories
              </button>
              {conditions.map(condition => (
                <button
                  key={condition}
                  onClick={() => setFilterCondition(condition)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filterCondition === condition ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          {/* Stories Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stories.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-gray-200">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No success stories yet</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to share your inspiring journey!</p>
              </div>
            ) : (
              stories.map(story => (
                <div key={story.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition">
                  <Link href={`/success-stories/${story.id}`} className="block p-6 pb-4">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {story.author.username[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{story.author.username}</h3>
                        <p className="text-sm text-gray-500">{new Date(story.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
                        {story.condition}
                      </span>
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{story.title}</h2>
                    <p className="text-gray-700 mb-4 line-clamp-4">{story.story}</p>

                    {/* Photos */}
                    {(story.beforePhoto || story.afterPhoto) && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {story.beforePhoto && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Before</p>
                            <img src={story.beforePhoto} alt="Before" className="w-full h-32 object-cover rounded-lg" />
                          </div>
                        )}
                        {story.afterPhoto && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">After</p>
                            <img src={story.afterPhoto} alt="After" className="w-full h-32 object-cover rounded-lg" />
                          </div>
                        )}
                      </div>
                    )}
                  </Link>

                  {/* Actions */}
                  <div className="flex items-center gap-4 px-6 pb-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        handleLike(story.id)
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="font-semibold">{story.likes}</span>
                    </button>
                    <Link href={`/success-stories/${story.id}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{story.commentCount}</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Share Story Form Modal */}
          {showShareForm && (
            <ShareStoryForm
              onClose={() => setShowShareForm(false)}
              onSuccess={() => {
                setShowShareForm(false)
                fetchStories()
              }}
            />
          )}
        </main>
      </div>
    </IridescenceLayout>
  )
}

function ShareStoryForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('')
  const [story, setStory] = useState('')
  const [condition, setCondition] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !story.trim() || !condition) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/v1/success-stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, story, condition })
      })

      if (response.ok) {
        alert('Story shared successfully! It is now visible to the community.')
        onSuccess()
      } else {
        const errorData = await response.json()
        alert(`Failed to share story: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sharing story:', error)
      alert('Failed to share story')
    } finally {
      setSubmitting(false)
    }
  }

  const conditions = ['Diabetes', 'Hypertension', 'Weight Loss', 'Mental Health', 'Heart Disease', 'Cancer', 'Other']

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Share Your Success Story</h2>
          <p className="text-sm text-gray-600 mt-1">Inspire others with your health journey</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., How I Beat Diabetes in 6 Months"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Select condition</option>
              {conditions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Story *</label>
            <textarea
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Share your journey, challenges, and how you overcame them..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your story will inspire others. Please avoid sharing sensitive personal medical details.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 font-semibold transition"
            >
              {submitting ? 'Sharing...' : 'Share Story'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
