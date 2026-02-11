'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  MessageSquare, 
  Pill, 
  User, 
  Settings, 
  PenSquare 
} from 'lucide-react'

export function Sidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { role, loading } = useUser()

  // Debug logging
  console.log('[Sidebar] Current role:', role)

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
    { name: 'Medication Reminder', icon: Pill, href: '/medications' },
    { name: 'Health Profile', icon: User, href: '/profile' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ]


  const navItems = role === 'VERIFIED_DOCTOR' ? doctorNav : [...commonCategories, ...patientNav]

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
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isExternal) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleExternalNav(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-neutral-300/20 text-left transition-all"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
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
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition-all ${isActive ? 'bg-blue-500/10 text-blue-600 font-semibold backdrop-blur-xl' : 'text-gray-600'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Specialties */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 mb-4 shadow-lg">
            <div className="px-4 py-3 border-b border-neutral-400/20 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Medical Specialties</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {specialties.map((specialty) => (
                <Link
                  key={specialty.slug}
                  href={`/m/${specialty.slug}`}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-all"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>m/{specialty.slug}</span>
                </Link>
              ))}
            </div>
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