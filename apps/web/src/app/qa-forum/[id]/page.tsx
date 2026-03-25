'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { ThumbsUp, CheckCircle, Award, ArrowLeft } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, role } = useJWTAuth()
  const [question, setQuestion] = useState<any>(null)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [answerText, setAnswerText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuestion()
    fetchAnswers()
  }, [params.id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions/${params.id}`)
      const data = await response.json()
      setQuestion(data.success ? data.data : null)
    } catch (error) {
      console.error('Error fetching question:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnswers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions/${params.id}/answers`)
      const data = await response.json()
      setAnswers(data.success ? data.data : [])
    } catch (error) {
      console.error('Error fetching answers:', error)
    }
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!answerText.trim()) return

    setSubmitting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/v1/qa-forum/questions/${params.id}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: answerText })
      })

      if (response.ok) {
        setAnswerText('')
        fetchAnswers()
        fetchQuestion()
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpvote = async (type: 'question' | 'answer', id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const endpoint = type === 'question' 
        ? `${API_URL}/api/v1/qa-forum/questions/${id}/upvote`
        : `${API_URL}/api/v1/qa-forum/answers/${id}/upvote`
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (type === 'question') {
        fetchQuestion()
      } else {
        fetchAnswers()
      }
    } catch (error) {
      console.error('Error upvoting:', error)
    }
  }

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch(`${API_URL}/api/v1/qa-forum/answers/${answerId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchAnswers()
      fetchQuestion()
    } catch (error) {
      console.error('Error accepting answer:', error)
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

  if (!question) {
    return (
      <IridescenceLayout>
        <NavbarEnhanced />
        <div className="max-w-[1440px] mx-auto flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Question not found</p>
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
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Questions
          </button>

          {/* Question */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleUpvote('question', question.id)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <ThumbsUp className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-bold text-lg">{question.upvotes}</span>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">{question.title}</h1>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{question.content}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex gap-2">
                    {question.tags?.map((tag: string) => (
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
          </div>

          {/* Answers */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            </h2>

            <div className="space-y-4">
              {answers.map(answer => (
                <div
                  key={answer.id}
                  className={`bg-white rounded-xl border-2 p-6 ${
                    answer.isAccepted ? 'border-green-500 bg-green-50/30' : 'border-gray-200'
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={() => handleUpvote('answer', answer.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <ThumbsUp className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="font-bold">{answer.upvotes}</span>
                      {answer.isAccepted && (
                        <CheckCircle className="w-6 h-6 text-green-600 fill-green-600" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{answer.content}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>
                            by {answer.author.username}
                            {answer.author.role === 'VERIFIED_DOCTOR' && (
                              <Award className="w-3 h-3 inline ml-1 text-blue-600" />
                            )}
                          </span>
                          <span className="text-gray-400">
                            {new Date(answer.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {user?.id === question.authorId && !answer.isAccepted && (
                          <button
                            onClick={() => handleAcceptAnswer(answer.id)}
                            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Accept Answer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Answer Form */}
          {user && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answer</h3>
              <form onSubmit={handleSubmitAnswer}>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Write your answer..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
                >
                  {submitting ? 'Posting...' : 'Post Answer'}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </IridescenceLayout>
  )
}
