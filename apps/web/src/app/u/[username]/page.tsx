'use client'

import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded border border-gray-300 p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {params.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">u/{params.username}</h1>
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
                <button className="px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722]">
                  Follow
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50">
                  Message
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex gap-6 border-b border-gray-200">
              <button className="px-4 py-2 font-semibold border-b-2 border-[#FF4500]">Posts</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50">Comments</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50">About</button>
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