'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { PostFeed } from '@/components/PostFeed'
import { CreatePostModal } from '@/components/CreatePostModal'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Users, Calendar, Shield } from 'lucide-react'
import IridescenceLayout from '@/components/IridescenceLayout'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Community {
  id: string
  name: string
  displayName: string
  description?: string
  icon?: string
  banner?: string
  memberCount: number
  isNSFW: boolean
  isPrivate: boolean
  isRestricted: boolean
  createdAt: string
  isMember?: boolean
  isModerator?: boolean
  _count: {
    members: number
    posts: number
  }
}

export default function CommunityPage({ params }: { params: { community: string } }) {
  const router = useRouter()
  const { user } = useJWTAuth()
  const [community, setCommunity] = useState<Community | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    loadCommunity()
  }, [params.community])

  const loadCommunity = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const response = await axios.get(
        `${API_URL}/api/v1/communities/${params.community}`,
        { headers }
      )
      setCommunity(response.data)
    } catch (error: any) {
      console.error('Failed to load community:', error)
      if (error.response?.status === 404) {
        alert('Community not found')
        router.push('/')
      } else if (error.response?.status === 403) {
        alert('This is a private community')
        router.push('/')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleJoinLeave = async () => {
    if (!user) {
      alert('Please login to join communities')
      router.push('/login')
      return
    }

    if (!community) return

    setJoining(true)
    try {
      const token = localStorage.getItem('auth_token')
      const endpoint = community.isMember ? 'leave' : 'join'
      
      await axios.post(
        `${API_URL}/api/v1/communities/${community.id}/${endpoint}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Reload community data
      await loadCommunity()
    } catch (error: any) {
      console.error('Failed to join/leave community:', error)
      alert(error.response?.data?.error || 'Failed to perform action')
    } finally {
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <NavbarEnhanced />
          <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading community...</p>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  if (!community) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <NavbarEnhanced />
          <div className="max-w-[1400px] mx-auto px-6 py-12 text-center">
            <p className="text-gray-600">Community not found</p>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
      <NavbarEnhanced />
      
      {/* Community Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-soft">
        {community.banner && (
          <div 
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${community.banner})` }}
          />
        )}
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {community.icon ? (
              <img
                src={community.icon}
                alt={community.displayName}
                className="w-16 h-16 rounded-full shadow-soft"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-soft">
                {community.displayName[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">{community.displayName}</h1>
              <p className="text-sm text-gray-600">m/{community.name}</p>
            </div>
            <button
              onClick={handleJoinLeave}
              disabled={joining}
              className={`px-6 py-2 rounded-full font-semibold transition shadow-soft hover:shadow-elevated disabled:opacity-50 ${
                community.isMember
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-cyan-500 text-white hover:bg-cyan-600'
              }`}
            >
              {joining ? 'Loading...' : community.isMember ? 'Joined' : 'Join'}
            </button>
          </div>

          {/* Community Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{community._count.members.toLocaleString()} members</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Created {new Date(community.createdAt).toLocaleDateString()}</span>
            </div>
            {community.isModerator && (
              <div className="flex items-center gap-2 text-blue-600">
                <Shield className="w-4 h-4" />
                <span>Moderator</span>
              </div>
            )}
          </div>

          {/* Description */}
          {community.description && (
            <p className="mt-4 text-gray-700">{community.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[640px]">
          <PostFeed community={params.community} />
        </main>
        
        {/* Community Sidebar */}
        <aside className="w-80 hidden lg:block">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-soft sticky top-20">
            <h3 className="font-bold text-lg mb-4">About Community</h3>
            
            {community.description && (
              <p className="text-sm text-gray-700 mb-4">{community.description}</p>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Members</span>
                <span className="font-semibold">{community._count.members.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Posts</span>
                <span className="font-semibold">{community._count.posts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span className="font-semibold">
                  {new Date(community.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>

            {community.isNSFW && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-700 font-semibold">18+ Community</p>
              </div>
            )}

            {community.isPrivate && (
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-700 font-semibold">Private Community</p>
              </div>
            )}

            {user && community.isMember && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full mt-4 px-4 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-soft"
              >
                Create Post
              </button>
            )}

            {community.isModerator && (
              <button
                onClick={() => router.push(`/m/${community.name}/settings`)}
                className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-full font-semibold hover:bg-gray-50 transition"
              >
                Mod Tools
              </button>
            )}
          </div>
        </aside>
      </div>
    </IridescenceLayout>

    <CreatePostModal
      isOpen={isCreateModalOpen}
      onClose={() => setIsCreateModalOpen(false)}
    />
  )
}
