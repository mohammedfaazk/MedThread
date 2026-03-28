'use client'

import { useState, useEffect } from 'react'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { MessageCircle, ThumbsUp, CheckCircle, Award, Search, Plus } from 'lucide-react'
import Link from 'next/link'
import IridescenceLayout from '@/components/IridescenceLayout'
import PageLoader from '@/components/PageLoader'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Question {
  id: string
  title: string
  content: string
  tags: string[]
  upvotes: number
  answerCount: number
  hasAcceptedAnswer: boolean
  author: {
    username: string
    role: string
  }
  createdAt: string
}

export default function QAForumPage() {
  const { user, role } = useJWTAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [showAskForm, setShowAskForm] = useState(false)

  useEffect(() => {
    fetchQuestions()
  }, [filterTag])

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams()
      if (filterTag) params.append('tag', filterTag)
      
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions?${params}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        // API returns { questions, pagination }
        setQuestions(data.data.questions || [])
      } else {
        setQuestions([])
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const searchQuestions = async () => {
    if (!searchQuery.trim()) {
      fetchQuestions()
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions/search?q=${searchQuery}`)
      const data = await response.json()
      setQuestions(data.success ? data.data : [])
    } catch (error) {
      console.error('Error searching:', error)
    }
  }

  const popularTags = ['diabetes', 'hypertension', 'mental-health', 'nutrition', 'exercise', 'medication']

  if (loading) {
    return <PageLoader message="Loading Q&A forum..." />;
  }

  return (
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="max-w-[1440px] mx-auto flex">
        <Sidebar />
        
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Q&A Forum</h1>
                <p className="text-gray-600">Ask questions, get answers from verified doctors</p>
              </div>
              <button
                onClick={() => setShowAskForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                <Plus className="w-5 h-5" />
                Ask Question
              </button>
            </div>

            {/* Search */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchQuestions()}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={searchQuestions}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
              >
                Search
              </button>
            </div>

            {/* Tags */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setFilterTag('')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  !filterTag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setFilterTag(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                    filterTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No questions found</p>
                <p className="text-sm text-gray-500 mt-2">Be the first to ask a question!</p>
              </div>
            ) : (
              questions.map(question => (
                <Link
                  key={question.id}
                  href={`/qa-forum/${question.id}`}
                  className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition"
                >
                  <div className="flex gap-4">
                    {/* Stats */}
                    <div className="flex flex-col items-center gap-2 text-sm">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold">{question.upvotes}</span>
                      </div>
                      <div className={`flex items-center gap-1 ${question.hasAcceptedAnswer ? 'text-green-600' : 'text-gray-400'}`}>
                        {question.hasAcceptedAnswer ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <MessageCircle className="w-4 h-4" />
                        )}
                        <span className="font-semibold">{question.answerCount}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600">
                        {question.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {question.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex gap-2">
                          {question.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-gray-500">
                          by {question.author.username}
                          {question.author.role === 'VERIFIED_DOCTOR' && (
                            <Award className="w-3 h-3 inline ml-1 text-blue-600" />
                          )}
                        </span>
                        <span className="text-gray-400">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Ask Question Form Modal */}
          {showAskForm && (
            <AskQuestionForm
              onClose={() => setShowAskForm(false)}
              onSuccess={() => {
                setShowAskForm(false)
                fetchQuestions()
              }}
            />
          )}
        </main>
      </div>
    </IridescenceLayout>
  )
}

function AskQuestionForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title, content, tags })
      })

      if (response.ok) {
        alert('Question posted successfully!')
        onSuccess()
      } else {
        alert('Failed to post question')
      }
    } catch (error) {
      console.error('Error posting question:', error)
      alert('Failed to post question')
    } finally {
      setSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
          <p className="text-sm text-gray-600 mt-1">Get answers from verified doctors</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Details *</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide more details about your question..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add tags..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
              >
                Add
              </button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm flex items-center gap-2">
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(tags.filter(t => t !== tag))}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {submitting ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
