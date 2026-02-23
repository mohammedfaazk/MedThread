'use client'

import { useState } from 'react'
import axios from 'axios'
import { Ban, Shield } from 'lucide-react'

interface BlockButtonProps {
  userId: string
  username: string
  onBlockChange?: (isBlocked: boolean) => void
}

export default function BlockButton({ userId, username, onBlockChange }: BlockButtonProps) {
  const [isBlocked, setIsBlocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  const handleBlock = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      
      if (!token) {
        alert('Please log in to block users')
        return
      }

      if (isBlocked) {
        // Unblock
        await axios.delete(`${API_URL}/api/block/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsBlocked(false)
        onBlockChange?.(false)
        alert(`Unblocked ${username}`)
      } else {
        // Block
        await axios.post(`${API_URL}/api/block/${userId}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsBlocked(true)
        onBlockChange?.(true)
        setShowConfirm(false)
        alert(`Blocked ${username}. They can no longer follow you, message you, or see your profile.`)
      }
    } catch (error: any) {
      console.error('Error blocking/unblocking:', error)
      const errorMessage = error.response?.data?.error || error.message
      alert(`Failed: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  if (showConfirm && !isBlocked) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Ban className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Block {username}?</h3>
            </div>
          </div>
          
          <div className="space-y-2 mb-6 text-sm text-gray-600">
            <p>When you block this user:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>They won't be able to follow you or see your posts</li>
              <li>They won't be able to message you</li>
              <li>They won't be able to see your profile</li>
              <li>All pending appointments will be cancelled</li>
              <li>You will unfollow each other</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleBlock}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Blocking...' : 'Block'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => isBlocked ? handleBlock() : setShowConfirm(true)}
      className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
        isBlocked
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          : 'bg-red-50 text-red-600 hover:bg-red-100'
      }`}
      disabled={loading}
    >
      {isBlocked ? (
        <>
          <Shield className="w-4 h-4" />
          <span>Unblock</span>
        </>
      ) : (
        <>
          <Ban className="w-4 h-4" />
          <span>Block</span>
        </>
      )}
    </button>
  )
}
