'use client'

import { Navbar } from '@/components/Navbar'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCommunityPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'public' | 'restricted' | 'private'>('public')
  const [isNSFW, setIsNSFW] = useState(false)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      alert('Please enter a community name')
      return
    }

    // Validate name format
    const nameRegex = /^[a-z0-9_-]+$/
    if (!nameRegex.test(name)) {
      alert('Community name can only contain lowercase letters, numbers, underscores, and hyphens')
      return
    }

    // Create community (demo)
    alert(`Community r/${name} created successfully!`)
    router.push(`/r/${name}`)
  }

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-3xl font-bold mb-2">Create a community</h1>
          <p className="text-gray-600 mb-8">
            Build and grow a community about something you care about
          </p>

          <form onSubmit={handleCreate} className="space-y-6">
            {/* Community Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Community names including capitalization cannot be changed
              </p>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l text-gray-600">
                  r/
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  placeholder="community_name"
                  maxLength={21}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{name.length}/21 characters</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Display Name (optional)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Community Display Name"
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell people what your community is about"
                rows={4}
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
            </div>

            {/* Community Type */}
            <div>
              <label className="block text-sm font-semibold mb-3">Community Type</label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value="public"
                    checked={type === 'public'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Public</p>
                    <p className="text-sm text-gray-600">Anyone can view, post, and comment</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value="restricted"
                    checked={type === 'restricted'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Restricted</p>
                    <p className="text-sm text-gray-600">Anyone can view, but only approved users can post</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="type"
                    value="private"
                    checked={type === 'private'}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-semibold">Private</p>
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
                  <p className="font-semibold">18+ year old community</p>
                  <p className="text-sm text-gray-600">Must be over 18 to view and contribute</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Community
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}