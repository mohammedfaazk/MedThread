'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { DoctorProfile } from '@/components/DoctorProfile'
import { useJWTAuth } from '@/context/JWTAuthContext'

export default function ProfilePage() {
  const { user, role, loading: userLoading, isDoctorVerified, isDoctorPending } = useJWTAuth()

  // Check if user is a doctor (verified or unverified)
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR' || isDoctorVerified || isDoctorPending

  if (userLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <NavbarEnhanced />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Profile Content */}
          {isDoctor ? (
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
