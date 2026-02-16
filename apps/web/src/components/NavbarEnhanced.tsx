'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { Search, Bell, Leaf, ChevronDown, CheckCircle2, Clock, X, TrendingUp, Hash, User as UserIcon } from 'lucide-react'
import { useSearchHistory } from '@/hooks/useSearchHistory'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Suggestion {
  id: string
  title?: string
  username?: string
  name?: string
  displayName?: string
  type: 'post' | 'user' | 'community'
  icon?: string
  verified?: boolean
}

export function NavbarEnhanced() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, role, loading, logout, isDoctorVerified, isDoctorPending } = useJWTAuth()
  const { history, addToHistory, removeFromHistory, clearHistory, getRecentSearches } = useSearchHistory()

  // Check if user is a doctor (verified or unverified)
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR' || isDoctorVerified || isDoctorPending

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([])
        return
      }

      setLoadingSuggestions(true)
      try {
        const response = await axios.get(`${API_URL}/api/v1/search/autocomplete`, {
          params: { q: searchQuery, limit: 5 }
        })

        if (response.data.success) {
          const data = response.data.data
          const allSuggestions: Suggestion[] = [
            ...data.posts.map((p: any) => ({ ...p, type: 'post' as const })),
            ...data.users.map((u: any) => ({ ...u, type: 'user' as const })),
            ...data.communities.map((c: any) => ({ ...c, type: 'community' as const }))
          ]
          setSuggestions(allSuggestions)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      addToHistory(searchQuery.trim())
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
      setSearchQuery('')
    }
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setShowSuggestions(false)
    setSearchQuery('')

    if (suggestion.type === 'post') {
      router.push(`/post/${suggestion.id}`)
    } else if (suggestion.type === 'user') {
      router.push(`/u/${suggestion.username}`)
    } else if (suggestion.type === 'community') {
      router.push(`/m/${suggestion.name}`)
    }
  }

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleLogout = async () => {
    setShowUserMenu(false)
    logout()
    router.push('/login')
  }

  const recentSearches = getRecentSearches(5)
  const showRecentSearches = showSuggestions && searchQuery.length === 0 && recentSearches.length > 0
  const showAutocompleteSuggestions = showSuggestions && searchQuery.length >= 2 && suggestions.length > 0

  return (
    <nav className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-[65px] flex items-center gap-4">
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

        {/* Search with Suggestions */}
        <div ref={searchRef} className="flex-1 max-w-[500px] relative">
          <form onSubmit={handleSearch}>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
              <input
                type="text"
                placeholder={role === 'VERIFIED_DOCTOR' ? "Search patients, cases, medical records..." : "Search doctors, symptoms, medications..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-11 pr-4 py-2 bg-neutral-300/20 hover:bg-neutral-300/30 backdrop-blur-[1px] border border-neutral-400/20 rounded-2xl text-sm focus:outline-none focus:border-blue-400/40 focus:bg-white/50 focus:ring-4 focus:ring-blue-100/50 transition-all"
              />
            </div>
          </form>

          {/* Suggestions Dropdown */}
          {(showRecentSearches || showAutocompleteSuggestions) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-96 overflow-y-auto">
              {/* Recent Searches */}
              {showRecentSearches && (
                <div>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200/50 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Recent Searches</span>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  {recentSearches.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors group"
                    >
                      <div
                        onClick={() => handleHistoryClick(item.query)}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{item.query}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromHistory(item.query)
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Autocomplete Suggestions */}
              {showAutocompleteSuggestions && (
                <div>
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200/50 bg-gray-50/50">
                    <TrendingUp className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Suggestions</span>
                  </div>
                  {suggestions.map((suggestion) => (
                    <div
                      key={`${suggestion.type}-${suggestion.id}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      {suggestion.type === 'post' && (
                        <>
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Search className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{suggestion.title}</p>
                            <p className="text-xs text-gray-500">Post</p>
                          </div>
                        </>
                      )}
                      {suggestion.type === 'user' && (
                        <>
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className="text-sm text-gray-800 truncate">u/{suggestion.username}</p>
                              {suggestion.verified && (
                                <CheckCircle2 className="w-3 h-3 text-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">User</p>
                          </div>
                        </>
                      )}
                      {suggestion.type === 'community' && (
                        <>
                          {suggestion.icon ? (
                            <img
                              src={suggestion.icon}
                              alt={suggestion.displayName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Hash className="w-4 h-4 text-cyan-600" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800 truncate">{suggestion.displayName}</p>
                            <p className="text-xs text-gray-500">m/{suggestion.name}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {loadingSuggestions && (
                <div className="px-4 py-3 text-center">
                  <div className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 hover:bg-neutral-300/20 backdrop-blur-[1px] border border-neutral-400/20 rounded-xl relative transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF4500] rounded-full"></span>
                </button>

                {showNotifications && (
                  <div className="absolute right-0 top-12 w-80 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="p-4 border-b border-neutral-400/20 bg-neutral-300/10">
                      <h3 className="font-semibold text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-neutral-300/20 cursor-pointer border-b border-neutral-400/10 transition-all">
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
                  className="flex items-center gap-3 px-2 py-1.5 hover:bg-neutral-300/20 backdrop-blur-[1px] border border-neutral-400/20 rounded-2xl transition-all group"
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
                  <div className="absolute right-0 top-12 w-56 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                    <Link href="/profile" className="block px-4 py-3 hover:bg-neutral-300/20 border-b border-neutral-400/20 transition-all">
                      <p className="font-semibold text-sm">My Profile</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </Link>
                    {isDoctor ? (
                      <Link href="/dashboard/doctor" className="block px-4 py-2 hover:bg-neutral-300/20 text-sm font-semibold text-blue-600 transition-all">Doctor Dashboard</Link>
                    ) : (
                      <Link href="/dashboard/patient" className="block px-4 py-2 hover:bg-neutral-300/20 text-sm font-semibold text-blue-600 transition-all">Patient Dashboard</Link>
                    )}
                    <Link href="/settings" className="block px-4 py-2 hover:bg-neutral-300/20 text-sm transition-all">Settings</Link>
                    <Link href="/saved" className="block px-4 py-2 hover:bg-neutral-300/20 text-sm transition-all">Saved Posts</Link>
                    <div className="border-t border-neutral-400/20">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-300/20 text-sm text-red-600 font-medium transition-all"
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
