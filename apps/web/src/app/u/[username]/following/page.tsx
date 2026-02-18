'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { UserPlus, Loader2, ArrowLeft, Stethoscope } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Following {
  id: string
  followingId: string
  createdAt: string
  following: {
    id: string
    username: string
    avatar: string | null
    role: string
    specialty?: string
    doctorVerificationStatus?: string
  }
}

export default function FollowingPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [following, setFollowing] = useState<Following[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserIdAndFollowing()
  }, [username])

  const fetchUserIdAndFollowing = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      // First, get user ID from username
      const userRes = await axios.get(`${API_URL}/api/users/by-username/${username}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })

      if (userRes.data.success) {
        const uid = userRes.data.data.id
        setUserId(uid)
        await fetchFollowing(uid)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setLoading(false)
    }
  }

  const fetchFollowing = async (uid: string, nextCursor?: string) => {
    try {
      const url = new URL(`${API_URL}/api/follow/${uid}/following`)
      if (nextCursor) {
        url.searchParams.append('cursor', nextCursor)
      }
      url.searchParams.append('limit', '20')

      const response = await axios.get(url.toString())

      if (response.data.success) {
        if (nextCursor) {
          setFollowing(prev => [...prev, ...response.data.data])
        } else {
          setFollowing(response.data.data)
        }
        setCursor(response.data.pagination?.nextCursor || null)
        setHasMore(response.data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching following:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (cursor && userId && !loading) {
      setLoading(true)
      fetchFollowing(userId, cursor)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavbarEnhanced />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/u/${username}`}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to profile
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {username}'s Following
                </h1>
                <p className="text-gray-600">
                  Following {following.length} verified doctor{following.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Following List */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden">
            {loading && following.length === 0 ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading following...</p>
              </div>
            ) : following.length === 0 ? (
              <div className="p-12 text-center">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Not following anyone yet
                </h3>
                <p className="text-gray-600">
                  This user isn't following any verified doctors yet.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {following.map((follow) => (
                    <Link
                      key={follow.id}
                      href={`/u/${follow.following.username}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-blue-700 font-bold flex-shrink-0 relative">
                          {follow.following.avatar ? (
                            <img
                              src={getImageUrl(follow.following.avatar) || ''}
                              alt={follow.following.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            follow.following.username.charAt(0).toUpperCase()
                          )}
                          {follow.following.role === 'DOCTOR' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
                              <Stethoscope className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {follow.following.username}
                            </h3>
                            {follow.following.doctorVerificationStatus === 'APPROVED' && (
                              <svg
                                className="w-4 h-4 text-blue-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          {follow.following.specialty && (
                            <p className="text-sm text-gray-600 truncate">
                              {follow.following.specialty}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            Following since {new Date(follow.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
