'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { Users, Loader2, ArrowLeft } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import Link from 'next/link'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Follower {
  id: string
  followerId: string
  createdAt: string
  follower: {
    id: string
    username: string
    avatar: string | null
    role: string
    specialty?: string
  }
}

export default function FollowersPage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [followers, setFollowers] = useState<Follower[]>([])
  const [loading, setLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUserIdAndFollowers()
  }, [username])

  const fetchUserIdAndFollowers = async () => {
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
        await fetchFollowers(uid)
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      setLoading(false)
    }
  }

  const fetchFollowers = async (uid: string, nextCursor?: string) => {
    try {
      const url = new URL(`${API_URL}/api/follow/${uid}/followers`)
      if (nextCursor) {
        url.searchParams.append('cursor', nextCursor)
      }
      url.searchParams.append('limit', '20')

      const response = await axios.get(url.toString())

      if (response.data.success) {
        if (nextCursor) {
          setFollowers(prev => [...prev, ...response.data.data])
        } else {
          setFollowers(response.data.data)
        }
        setCursor(response.data.pagination?.nextCursor || null)
        setHasMore(response.data.pagination?.hasMore || false)
      }
    } catch (error) {
      console.error('Error fetching followers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLoadMore = () => {
    if (cursor && userId && !loading) {
      setLoading(true)
      fetchFollowers(userId, cursor)
    }
  }

  return (
    <div className="min-h-screen">
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
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {username}'s Followers
                </h1>
                <p className="text-gray-600">
                  {followers.length} follower{followers.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Followers List */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden">
            {loading && followers.length === 0 ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading followers...</p>
              </div>
            ) : followers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No followers yet
                </h3>
                <p className="text-gray-600">
                  This user doesn't have any followers yet.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {followers.map((follow) => (
                    <Link
                      key={follow.id}
                      href={`/u/${follow.follower.username}`}
                      className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                          {follow.follower.avatar ? (
                            <img
                              src={getImageUrl(follow.follower.avatar) || ''}
                              alt={follow.follower.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            follow.follower.username.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {follow.follower.username}
                            </h3>
                            {follow.follower.role === 'DOCTOR' && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                Doctor
                              </span>
                            )}
                          </div>
                          {follow.follower.specialty && (
                            <p className="text-sm text-gray-600 truncate">
                              {follow.follower.specialty}
                            </p>
                          )}
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
