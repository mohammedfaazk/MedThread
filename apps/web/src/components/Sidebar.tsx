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

  // Debug logging
  console.log('[Sidebar] Current role:', role)

  interface NavItem {
    name: string;
    icon: string;
    href: string;
    isExternal?: boolean;
    active?: boolean;
  }

  const commonCategories: NavItem[] = [
    { name: 'Dashboard', icon: '📊', href: '/dashboard/patient' },
    { name: 'Symptom Checker', icon: '🩺', href: '/symptom-checker' },
    { name: 'Book Appointment', icon: '📅', href: '/appointments' },
  ]

  const doctorNav: NavItem[] = [
    { name: 'Dashboard', icon: '📊', href: '/dashboard/doctor' },
    { name: 'Chat with Patients', icon: '💬', href: '/chat' },
    { name: 'Discussion Threads', icon: '✍️', href: '#' }, // Triggers modal (Create Post)
    { name: 'Profile', icon: '👤', href: '/profile' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
  ]

  const patientNav: NavItem[] = [
    { name: 'Chat with Doctors', icon: '💬', href: '/chat' },
    { name: 'Medication Reminder', icon: '💊', href: '/medications' },
    { name: 'Health Profile', icon: '👤', href: '/profile' },
    { name: 'Settings', icon: '⚙️', href: '/settings' },
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
                    if (item.name === 'Create Post' || item.name === 'Discussion Threads') {
                      e.preventDefault();
                      setIsCreateModalOpen(true);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600'
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