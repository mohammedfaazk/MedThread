'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, TrendingUp, AlertCircle, List } from 'lucide-react'

export function Sidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  
  const categories = [
    { name: 'Home', icon: Home, href: '/', active: true },
    { name: 'Popular', icon: TrendingUp, href: '/popular', active: false },
    { name: 'Emergency', icon: AlertCircle, href: '/emergency', active: false },
    { name: 'All', icon: List, href: '/all', active: false },
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
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 mb-4 shadow-lg overflow-hidden">
            {categories.map((cat) => {
              const IconComponent = cat.icon
              return (
                <Link
                  key={cat.name}
                  href={cat.href}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-cream-50/50 transition ${
                    cat.active ? 'bg-yellow-100/50 border-r-4 border-yellow-200 font-semibold' : ''
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-charcoal">{cat.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Specialties */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 mb-4 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200/50 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-600 uppercase">Medical Specialties</h3>
              <button
                onClick={handleCreateCommunity}
                className="text-xs text-charcoal hover:text-yellow-200 font-semibold transition"
              >
                + Create
              </button>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.slug}
                  href={`/m/${specialty.slug}`}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-cream-50/60 flex items-center gap-2 transition"
                >
                  <span className="w-2 h-2 bg-yellow-200 rounded-full"></span>
                  <span className="text-gray-700">m/{specialty.slug}</span>
                </Link>
              ))}
            </div>
            <button
              onClick={handleCreateCommunity}
              className="w-full px-4 py-2 text-sm text-charcoal hover:bg-cream-50/50 border-t border-gray-200/50 font-semibold transition"
            >
              + Create Community
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/30 mb-4 shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200/50">
              <h3 className="text-xs font-bold text-gray-600 uppercase">Resources</h3>
            </div>
            <Link href="/about" className="block px-4 py-2 text-sm hover:bg-cream-50/50 text-charcoal transition">
              About MedThread
            </Link>
            <Link href="/help" className="block px-4 py-2 text-sm hover:bg-cream-50/50 text-charcoal transition">
              Help Center
            </Link>
            <Link href="/guidelines" className="block px-4 py-2 text-sm hover:bg-cream-50/50 text-charcoal transition">
              Community Guidelines
            </Link>
            <Link href="/doctors" className="block px-4 py-2 text-sm hover:bg-cream-50/50 text-charcoal transition">
              For Doctors
            </Link>
          </div>

          {/* Create Post Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full px-4 py-3 bg-cyan-500 text-white rounded-full font-semibold hover:bg-cyan-600 transition-all shadow-soft hover:shadow-elevated hover:scale-105"
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