'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const { user, loading, signOut } = useUser()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    await signOut()
    setShowUserMenu(false)
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4 hover:opacity-80 transition">
          <div className="w-8 h-8 bg-[#FF4500] rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <span className="font-bold text-xl hidden sm:block">MedThread</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[600px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search medical discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-1.5 bg-gray-100 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <button type="submit" className="absolute right-3 top-2">
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-gray-100 rounded relative"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4500] rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                        <p className="text-sm"><span className="font-semibold">Dr_Sarah_Johnson</span> replied to your post</p>
                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded border border-transparent hover:border-gray-200"
                >
                  <div className="w-6 h-6 bg-[#FF4500] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden md:block max-w-[100px] truncate">{user.email}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
                    <Link href="/profile" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-200">
                      <p className="font-semibold text-sm">My Profile</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 hover:bg-gray-50 text-sm">Settings</Link>
                    <Link href="/saved" className="block px-4 py-2 hover:bg-gray-50 text-sm">Saved Posts</Link>
                    <div className="border-t border-gray-200">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-red-600 font-medium"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : !loading && (
            <Link
              href="/login"
              className="px-6 py-1.5 bg-[#FF4500] text-white rounded-full text-sm font-semibold hover:bg-[#ff5722] transition shadow-sm"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}