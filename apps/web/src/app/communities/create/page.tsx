'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useJWTAuth } from '@/context/JWTAuthContext'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { user } = useJWTAuth()
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'public' | 'restricted' | 'private'>('public')
  const [isNSFW, setIsNSFW] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please login to create a community')
      router.push('/login')
      return
    }

    if (!name.trim()) {
      alert('Please enter a community name')
      return
    }

    // Validate name format
    const nameRegex = /^[a-zA-Z0-9_]{3,21}$/
    if (!nameRegex.test(name)) {
      alert('Community name must be 3-21 characters and contain only letters, numbers, and underscores')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${API_URL}/api/v1/communities`,
        {
          name: name.toLowerCase(),
          displayName: displayName || name,
          description,
          isPrivate: type === 'private',
          isRestricted: type === 'restricted',
          isNSFW,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      alert(`Community m/${name} created successfully!`)
      router.push(`/m/${name}`)
    } catch (error: any) {
      console.error('Failed to create community:', error)
      alert(error.response?.data?.error || 'Failed to create community. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <NavbarEnhanced />
        <div className="max-w-3xl mx-auto px-6 py-12">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft text-center">
            <h2 className="text-2xl font-bold mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to create a community</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-3xl font-bold mb-2 text-charcoal">Create a community</h1>
          <p className="text-gray-600 mb-8">
            Build and grow a community about something you care about
          </p>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-charcoal">
                Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Community names including capitalization cannot be changed
              </p>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-cream-50 border border-r-0 border-gray-200 rounded-l text-gray-600">
                  m/
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="community_name"
                  maxLength={21}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-r focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{name.length}/21 characters</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-charcoal">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Community Display Name"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2 text-charcoal">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what your community is about"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            {/* Community Type */}
            <div>
              <label className="block text-sm font-semibold mb-3 text-charcoal">Community Type</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-cream-50/50 transition">
                  <input
                    type="radio"
                    name="type"
                    value="public"
                    checked={type === 'public'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-charcoal">Public</p>
                    <p className="text-sm text-gray-600">Anyone can view, post, and comment</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-cream-50/50 transition">
                  <input
                    type="radio"
                    name="type"
                    value="restricted"
                    checked={type === 'restricted'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-charcoal">Restricted</p>
                    <p className="text-sm text-gray-600">Anyone can view, but only approved users can post</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-cream-50/50 transition">
                  <input
                    type="radio"
                    name="type"
                    value="private"
                    checked={type === 'private'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold text-charcoal">Private</p>
                    <p className="text-sm text-gray-600">Only approved users can view and post</p>
                  </div>
                </label>
              </div>
            </div>

            {/* NSFW */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNSFW}
                  onChange={(e) => setIsNSFW(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-charcoal">18+ year old community</p>
                  <p className="text-sm text-gray-600">Must be over 18 to view and contribute</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200/50">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2 border border-gray-200 rounded-full font-semibold hover:bg-cream-50/50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex-1 px-6 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-soft hover:shadow-elevated"
              >
                {loading ? 'Creating...' : 'Create Community'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}