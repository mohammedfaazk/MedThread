'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 pt-4 pb-4">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo - Separate rounded container */}
        <Link href="/" className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-5 py-3 rounded-full shadow-soft hover:shadow-elevated transition-all hover:scale-105">
          <div className="w-9 h-9 bg-gradient-to-br from-charcoal to-charcoal-light rounded-2xl flex items-center justify-center shadow-soft">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl text-charcoal hidden sm:block">MedThread</span>
        </Link>

        {/* Main Navigation Container - Rounded pill */}
        <div className="flex-1 max-w-[900px] bg-white/80 backdrop-blur-md rounded-full shadow-soft px-4 py-2 flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search medical discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-5 py-2 bg-cream-100 border border-transparent rounded-full text-sm focus:outline-none focus:border-yellow-200 focus:bg-white transition-all"
              />
              <button type="submit" className="absolute right-4 top-2">
                <svg className="w-5 h-5 text-gray-400 hover:text-charcoal transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200"></div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-cream-100 rounded-full relative transition"
            >
              <svg className="w-5 h-5 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-200 rounded-full border-2 border-white"></span>
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 bg-white border border-gray-200 rounded-2xl shadow-elevated">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-charcoal">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="p-4 hover:bg-cream-50 cursor-pointer border-b border-gray-50 transition">
                    <p className="text-sm text-charcoal"><span className="font-semibold">Dr_Sarah_Johnson</span> replied to your post</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                  <div className="p-4 hover:bg-cream-50 cursor-pointer border-b border-gray-50 transition">
                    <p className="text-sm text-charcoal">Your post received 10 upvotes</p>
                    <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 hover:bg-cream-100 rounded-full transition"
            >
              <div className="w-7 h-7 bg-gradient-to-br from-yellow-200 to-yellow-300 rounded-full shadow-soft"></div>
              <svg className="w-4 h-4 text-charcoal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-2xl shadow-elevated overflow-hidden">
                <Link href="/profile" className="block px-4 py-3 hover:bg-cream-50 border-b border-gray-100 transition">
                  <p className="font-semibold text-charcoal">My Profile</p>
                  <p className="text-xs text-gray-500">View your profile</p>
                </Link>
                <Link href="/settings" className="block px-4 py-2.5 hover:bg-cream-50 text-sm text-charcoal transition">
                  Settings
                </Link>
                <Link href="/saved" className="block px-4 py-2.5 hover:bg-cream-50 text-sm text-charcoal transition">
                  Saved Posts
                </Link>
                <Link href="/history" className="block px-4 py-2.5 hover:bg-cream-50 text-sm text-charcoal transition">
                  History
                </Link>
                <div className="border-t border-gray-200">
                  <button className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition">
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Login Button - Separate rounded container */}
        <Link
          href="/login"
          className="bg-charcoal text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-charcoal-light transition-all shadow-soft hover:shadow-elevated hover:scale-105 whitespace-nowrap"
        >
          Log In
        </Link>
      </div>
    </nav>
  )
}