'use client'

import { useState, useEffect } from 'react'
import { CreatePostModal } from './CreatePostModal'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import axios from 'axios'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  MessageSquare, 
  Pill, 
  User, 
  Settings, 
  PenSquare,
  Coins
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Community {
  id: string
  name: string
  displayName: string
  memberCount: number
}

export function Sidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [communities, setCommunities] = useState<Community[]>([])
  const [loadingCommunities, setLoadingCommunities] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { role, loading, isDoctorVerified, isDoctorPending } = useJWTAuth()

  // Check if user is a doctor (verified or unverified)
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR' || isDoctorVerified || isDoctorPending

  // Fetch communities on mount
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/communities?limit=20&sortBy=members`)
        setCommunities(response.data.communities || response.data)
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setLoadingCommunities(false)
      }
    }

    fetchCommunities()
  }, [])

  interface NavItem {
    name: string;
    icon: any;
    href: string;
    isExternal?: boolean;
    active?: boolean;
  }

  const commonCategories: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/patient' },
    { name: 'Symptom Checker', icon: Stethoscope, href: '/symptom-checker' },
    { name: 'Book Appointment', icon: Calendar, href: '/appointments' },
  ]

  const doctorNav: NavItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard/doctor' },
    { name: 'Chat with Patients', icon: MessageSquare, href: '/chat' },
    { name: 'Discussion Threads', icon: PenSquare, href: '#' }, // Triggers modal (Create Post)
    { name: 'Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ]

  const patientNav: NavItem[] = [
    { name: 'Chat with Doctors', icon: MessageSquare, href: '/chat' },
    { name: 'Create Post', icon: PenSquare, href: '#' }, // Triggers modal (same as doctors)
    { name: 'Medication Reminder', icon: Pill, href: '/medications' },
    { name: 'Health Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ]


  const navItems = isDoctor ? doctorNav : [...commonCategories, ...patientNav]

  const handleExternalNav = (href: string) => {
    window.location.href = href;
  }

  if (loading) {
    return (
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-[68px] p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-60 bg-gray-200 rounded"></div>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <>
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-[68px] p-4">
          {/* Main Navigation */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 overflow-hidden shadow-lg">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;

              const NavItemContent = (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${isActive ? 'bg-blue-500/10 text-blue-600 font-semibold backdrop-blur-xl' : 'text-gray-900'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </motion.div>
              );

              if (item.isExternal) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleExternalNav(item.href)}
                    className="w-full text-left"
                  >
                    {NavItemContent}
                  </button>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (item.name === 'Create Post' || item.name === 'Discussion Threads') {
                      e.preventDefault();
                      setIsCreateModalOpen(true);
                    }
                  }}
                >
                  {NavItemContent}
                </Link>
              )
            })}
          </div>

          {/* Communities */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-lg">
            <div className="px-4 py-3 border-b border-cyan-200/30 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 uppercase">Communities</h3>
              <Link
                href="/communities/create"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Create
              </Link>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {loadingCommunities ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  Loading...
                </div>
              ) : communities.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-gray-500 mb-2">No communities yet</p>
                  <Link
                    href="/communities/create"
                    className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Create the first one
                  </Link>
                </div>
              ) : (
                communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/m/${community.name}`}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between transition-all ${
                      pathname === `/m/${community.name}` ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>m/{community.name}</span>
                    </div>
                    <span className="text-xs text-gray-900">{community.memberCount}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Library */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-lg">
            <div className="px-4 py-3 border-b border-cyan-200/30">
              <h3 className="text-xs font-bold text-gray-700 uppercase">Library</h3>
            </div>
            <Link
              href="/saved"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${pathname === '/saved' ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Saved</span>
            </Link>
            <Link
              href="/hidden"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${pathname === '/hidden' ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <span>Hidden</span>
            </Link>
            <Link
              href="/history"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${pathname === '/history' ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>History</span>
            </Link>
            <Link
              href="/leaderboard"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${pathname === '/leaderboard' ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/shop"
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${pathname === '/shop' ? 'bg-blue-500/10 text-blue-600 font-semibold' : 'text-gray-900'}`}
            >
              <Coins className="w-5 h-5" />
              <span>Coin Shop</span>
            </Link>
          </div>

        </div>
      </aside>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  )
}