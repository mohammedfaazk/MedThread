'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-soft">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-charcoal text-4xl font-bold shadow-soft">
              {params.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-charcoal">u/{params.username}</h1>
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-semibold">1,234</span> Post Karma
                </div>
                <div>
                  <span className="font-semibold">5,678</span> Comment Karma
                </div>
                <div>
                  Member since <span className="font-semibold">Jan 2024</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition shadow-soft hover:shadow-elevated">
                  Follow
                </button>
                <button className="px-6 py-2 border border-gray-200 rounded-full font-semibold hover:bg-cream-50/50 transition">
                  Message
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200/50 pt-6">
            <div className="flex gap-6 border-b border-gray-200/50">
              <button className="px-4 py-2 font-semibold border-b-2 border-yellow-200 text-charcoal">Posts</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-cream-50/50 rounded-t transition">Comments</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-cream-50/50 rounded-t transition">About</button>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600">No posts yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}