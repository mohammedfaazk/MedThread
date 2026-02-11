'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import { DoctorProfile } from '@/components/DoctorProfile'
import { useUser } from '@/context/UserContext'

export default function ProfilePage() {
  const { user, role, loading: userLoading } = useUser()

  const userRole = role;

  if (userLoading || !user) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Profile Content */}
          {userRole === 'VERIFIED_DOCTOR' ? (
            <DoctorProfile />
          ) : (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 hover:shadow-xl transition-all">
              <h2 className="text-2xl font-bold mb-4">Patient Profile</h2>
              <p className="text-gray-600">Patient profile view coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
