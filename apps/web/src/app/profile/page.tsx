'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded border border-gray-300 p-8">
          <h1 className="text-3xl font-bold mb-6">My Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <input type="text" value="current_user" className="w-full px-4 py-2 border border-gray-300 rounded" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" value="user@example.com" className="w-full px-4 py-2 border border-gray-300 rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded" placeholder="Tell us about yourself..."></textarea>
            </div>
            <button className="px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722]">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}