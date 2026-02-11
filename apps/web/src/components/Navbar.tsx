import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Search, Bell, User, LogOut, Settings, Heart, Leaf, Stethoscope, ChevronDown, CheckCircle2 } from 'lucide-react'

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const router = useRouter()
  const { user, role, loading, logout } = useJWTAuth()
  
  // Display name helper
  const displayName = user?.username || user?.email?.split('@')[0] || 'User'
  const displayRole = role?.replace('_', ' ')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = async () => {
    setShowUserMenu(false)
    logout()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-300 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 h-12 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-6 hover:opacity-80 transition group">
          <div className="w-10 h-10 bg-gradient-to-br from-[#5CB8B2] to-[#4DA9A3] rounded-xl flex items-center justify-center shadow-lg shadow-[#9DD4D3] group-hover:scale-105 transition-transform">
            <Leaf className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight text-slate-800 leading-none">MedThread</span>
            <span className="text-[10px] text-[#5CB8B2] font-bold uppercase tracking-widest mt-0.5">Healthcare</span>
          </div>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-[500px]">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder={role === 'VERIFIED_DOCTOR' ? "Search patients, cases, medical records..." : "Search doctors, symptoms, medications..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 bg-slate-100 border border-transparent rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all"
            />
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
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-50 rounded-2xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold border border-blue-200 group-hover:shadow-md transition-all">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col items-start hidden lg:flex">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-sm font-semibold text-slate-700 leading-none">{user.email?.split('@')[0]}</span>
                      {role === 'VERIFIED_DOCTOR' && <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-500/10" />}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{role?.replace('_', ' ')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-12 w-56 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
                    <Link href="/profile" className="block px-4 py-3 hover:bg-gray-50 border-b border-gray-200">
                      <p className="font-semibold text-sm">My Profile</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </Link>
                    {role === 'VERIFIED_DOCTOR' ? (
                      <Link href="/dashboard/doctor" className="block px-4 py-2 hover:bg-gray-50 text-sm font-semibold text-blue-600">Doctor Dashboard</Link>
                    ) : (
                      <Link href="/dashboard/patient" className="block px-4 py-2 hover:bg-gray-50 text-sm font-semibold text-blue-600">Patient Dashboard</Link>
                    )}
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