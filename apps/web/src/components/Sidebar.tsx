'use client'

import { useState } from 'react'
import { CreatePostModal } from './CreatePostModal'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/context/UserContext'

export function Sidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { role, loading } = useUser()

  interface NavItem {
    name: string;
    icon: string;
    href: string;
    isExternal?: boolean;
    active?: boolean;
  }

  const commonCategories: NavItem[] = [
    { name: 'Home', icon: '🏠', href: '/' },
    { name: 'Popular', icon: '🔥', href: '/popular' },
    { name: 'Emergency', icon: '🚨', href: '/emergency' },
  ]

  const doctorNav: NavItem[] = [
    { name: 'Chat with Patients', icon: '💬', href: '/profile?tab=consultation' },
    { name: 'Appointments', icon: '📅', href: '/profile?tab=appointments' },
    { name: 'Create Post', icon: '✍️', href: '#' }, // Triggers modal
    { name: 'Profile', icon: '👤', href: '/profile' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ]

  const patientNav: NavItem[] = [
    { name: 'Chat with Doctor', icon: '💬', href: '/profile?tab=consultation' },
    { name: 'Book Appointment', icon: '📅', href: '/doctors' },
    { name: 'AI Chatbot', icon: '🤖', isExternal: true, href: process.env.NEXT_PUBLIC_AI_CHATBOT_URL || '#' },
    { name: 'Diet Planner', icon: '🥗', isExternal: true, href: process.env.NEXT_PUBLIC_DIET_PLANNER_URL || '#' },
    { name: 'Medication Reminder', icon: '💊', isExternal: true, href: process.env.NEXT_PUBLIC_MED_REMINDER_URL || '#' },
    { name: 'Profile', icon: '👤', href: '/profile' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ]


  const navItems = role === 'VERIFIED_DOCTOR' ? [...commonCategories, ...doctorNav] : [...commonCategories, ...patientNav]

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
        <div className="animate-pulse space-y-4">
          <div className="h-40 bg-gray-200 rounded"></div>
          <div className="h-60 bg-gray-200 rounded"></div>
        </div>
      </aside>
    )
  }

  return (
    <>
      <aside className="hidden lg:block w-[260px] shrink-0">
        <div className="sticky top-[68px]">
          {/* Main Navigation */}
          <div className="bg-white rounded border border-gray-300 mb-4 overflow-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              if (item.isExternal) {
                return (
                  <button
                    key={item.name}
                    onClick={() => handleExternalNav(item.href)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-left transition"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    if (item.name === 'Create Post') {
                      e.preventDefault();
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${isActive ? 'bg-gray-100 border-r-4 border-[#FF4500] font-semibold' : ''
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Specialties */}
          <div className="bg-white rounded border border-gray-300 mb-4">
            <div className="px-4 py-3 border-b border-gray-300 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-500 uppercase">Medical Specialties</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
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