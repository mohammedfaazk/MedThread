'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <h1 className="text-3xl font-bold mb-6 text-charcoal">My Profile</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-charcoal">Username</label>
              <input type="text" value="current_user" className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-charcoal">Email</label>
              <input type="email" value="user@example.com" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 bg-white/50 backdrop-blur-sm transition" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-charcoal">Bio</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-200 resize-none bg-white/50 backdrop-blur-sm transition" placeholder="Tell us about yourself..."></textarea>
            </div>
            <button className="px-6 py-2.5 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-soft hover:shadow-elevated">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}