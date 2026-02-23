'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { Ban, Shield, ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface BlockedUser {
  id: string
  blockedId: string
  createdAt: string
  blocked: {
    id: string
    username: string
    avatar: string | null
    role: string
    specialty?: string
  }
}

export default function BlockedUsersPage() {
  const { user } = useJWTAuth()
  const router = useRouter()
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [unblocking, setUnblocking] = useState<string | null>(null)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      fetchBlockedUsers()
    }
  }, [user])

  const fetchBlockedUsers = async (nextCursor?: string) => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        router.push('/login')
        return
      }

      const url = new URL(`${API_URL}/api/block/list`)
      if (nextCursor) {
        url.searchParams.append('cursor', nextCursor)
      }
      url.searchParams.append('limit', '20')

      const response = await axios.get(url.toString(), {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        if (nextCursor) {
          setBlockedUsers(prev => [...prev, ...response.data.data])
        } else {
          setBlockedUsers(response.data.data)
        }
        setCursor(response.data.pagination?.nextCursor || null)
        setHasMore(response.data.pagination?.hasMore || false)
      }
    } catch (error: any) {
      console.error('Error fetching blocked users:', error)
      setError(error.response?.data?.error || 'Failed to load blocked users')
    } finally {
      setLoading(false)
    }
  }

  const handleUnblock = async (userId: string, username: string) => {
    if (!confirm(`Unblock ${username}? They will be able to follow you and message you again.`)) {
      return
    }

    try {
      setUnblocking(userId)
      const token = localStorage.getItem('auth_token')

      await axios.delete(`${API_URL}/api/block/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setBlockedUsers(prev => prev.filter(b => b.blocked.id !== userId))
      
      // Show success message
      const successMsg = document.createElement('div')
      successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'
      successMsg.textContent = `Unblocked ${username}`
      document.body.appendChild(successMsg)
      setTimeout(() => successMsg.remove(), 3000)
    } catch (error: any) {
      console.error('Error unblocking user:', error)
      alert(error.response?.data?.error || 'Failed to unblock user')
    } finally {
      setUnblocking(null)
    }
  }

  const handleLoadMore = () => {
    if (cursor && !loading) {
      fetchBlockedUsers(cursor)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <NavbarEnhanced />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Ban className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blocked Users</h1>
                <p className="text-gray-600">
                  Manage users you've blocked
                </p>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">About blocking</p>
                <ul className="space-y-1 text-blue-800">
                  <li>• Blocked users cannot follow you or see your profile</li>
                  <li>• They cannot send you messages or appointment requests</li>
                  <li>• All pending appointments are automatically cancelled</li>
                  <li>• You will unfollow each other automatically</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Blocked Users List */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm overflow-hidden">
            {loading && blockedUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading blocked users...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-medium mb-2">Error loading blocked users</p>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchBlockedUsers()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : blockedUsers.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No blocked users
                </h3>
                <p className="text-gray-600">
                  You haven't blocked anyone yet. When you block someone, they'll appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-100">
                  {blockedUsers.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold flex-shrink-0">
                            {block.blocked.avatar ? (
                              <img
                                src={getImageUrl(block.blocked.avatar) || ''}
                                alt={block.blocked.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              block.blocked.username.charAt(0).toUpperCase()
                            )}
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {block.blocked.username}
                              </h3>
                              {block.blocked.role === 'DOCTOR' && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                  Doctor
                                </span>
                              )}
                            </div>
                            {block.blocked.specialty && (
                              <p className="text-sm text-gray-600 truncate">
                                {block.blocked.specialty}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Blocked {new Date(block.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Unblock Button */}
                        <button
                          onClick={() => handleUnblock(block.blocked.id, block.blocked.username)}
                          disabled={unblocking === block.blocked.id}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
                        >
                          {unblocking === block.blocked.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Unblocking...</span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4" />
                              <span>Unblock</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Stats */}
          {blockedUsers.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {blockedUsers.length} blocked user{blockedUsers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
