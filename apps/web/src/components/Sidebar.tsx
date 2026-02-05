'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Sidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  
  const categories = [
    { name: 'Home', icon: '🏠', href: '/', active: true },
    { name: 'Popular', icon: '🔥', href: '/popular', active: false },
    { name: 'Emergency', icon: '🚨', href: '/emergency', active: false },
    { name: 'All', icon: '📋', href: '/all', active: false },
  ]

  const specialties = [
    { name: 'General Health', slug: 'general' },
    { name: 'Cardiology', slug: 'cardiology' },
    { name: 'Neurology', slug: 'neurology' },
    { name: 'Dermatology', slug: 'dermatology' },
    { name: 'Pediatrics', slug: 'pediatrics' },
    { name: 'Mental Health', slug: 'mental-health' },
    { name: 'Orthopedics', slug: 'orthopedics' },
    { name: 'Gastroenterology', slug: 'gastroenterology' },
  ]

  const handleCreateCommunity = () => {
    router.push('/communities/create')
  }

  return (
    <>
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-[68px]">
          {/* Main Navigation */}
          <div className="bg-white rounded border border-gray-300 mb-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 ${
                  cat.active ? 'bg-gray-100 border-r-4 border-[#FF4500] font-semibold' : ''
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>

          {/* Specialties */}
          <div className="bg-white rounded border border-gray-300 mb-4">
            <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Medical Specialties</h3>
              <button
                onClick={handleCreateCommunity}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                + Create
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.slug}
                  href={`/r/${specialty.slug}`}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>r/{specialty.slug}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={handleCreateCommunity}
              className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 border-t border-gray-200 font-semibold"
            >
              + Create Community
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded border border-gray-300 mb-4">
            <div className="px-4 py-3 border-b border-gray-300">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Resources</h3>
            </div>
            <Link href="/about" className="block px-4 py-2 text-sm hover:bg-gray-50">
              About MedThread
            </Link>
            <Link href="/help" className="block px-4 py-2 text-sm hover:bg-gray-50">
              Help Center
            </Link>
            <Link href="/guidelines" className="block px-4 py-2 text-sm hover:bg-gray-50">
              Community Guidelines
            </Link>
            <Link href="/doctors" className="block px-4 py-2 text-sm hover:bg-gray-50">
              For Doctors
            </Link>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full px-4 py-2.5 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722] transition"
          >
            Create Post
          </button>
        </div>
      </aside>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}