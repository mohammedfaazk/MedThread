'use client'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { AppointmentCalendar } from '@/components/Board/AppointmentCalendar'
import { useUser } from '@/context/UserContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [showBooking, setShowBooking] = useState(false)
  const { user: currentUser, role: currentUserRole, profileId: currentProfileId, loading: contextLoading } = useUser()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const effectiveCurrentUserId = currentProfileId || currentUser?.id;

  useEffect(() => {
    fetchProfile()
  }, [params.username])

  const fetchProfile = async () => {
    try {
      // 1. Try finding as a doctor by ID
      let { data: profile, error: dError } = await supabase
        .from('doctors')
        .select('*')
        .eq('id', params.username)
        .maybeSingle()

      let role: 'VERIFIED_DOCTOR' | 'PATIENT' = 'VERIFIED_DOCTOR'

      // 2. Try finding as a patient by ID
      if (!profile) {
        role = 'PATIENT'
        const { data: patientById } = await supabase
          .from('patient_health_record')
          .select('*')
          .eq('user_id', params.username) // Use user_id for patients usually
          .maybeSingle()

        if (!patientById) {
          const { data: patientByIdFull } = await supabase
            .from('patient_health_record')
            .select('*')
            .eq('id', params.username)
            .maybeSingle()
          if (patientByIdFull) profile = patientByIdFull
        } else {
          profile = patientById
        }
      }

      if (profile) {
        console.log('Found profile:', profile);
        setProfileUser({ ...profile, role })
      } else {
        console.warn('No user found for ID:', params.username)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || contextLoading) return <div className="p-8">Loading profile...</div>
  if (!profileUser) return <div className="p-8 text-center text-gray-500">User not found</div>

  const doctorId = profileUser.id;

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded border border-gray-300 p-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
              {params.username[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profileUser.full_name || profileUser.name || `u/${params.username}`}
              </h1>
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-semibold">1,234</span> Post Karma
                </div>
                <div>
                  <span className="font-semibold">5,678</span> Comment Karma
                </div>
                <div>
                  Member since <span className="font-semibold">Jan 2024</span>
                </div>
                {profileUser.role === 'VERIFIED_DOCTOR' && profileUser.specialization && (
                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                    {profileUser.specialization}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-[#FF4500] text-white rounded-full font-semibold hover:bg-[#ff5722]">
                  Follow
                </button>
                <Link href={`/profile?tab=consultation&doctor=${doctorId}`}>
                  <button className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50">
                    Message
                  </button>
                </Link>

                {/* Show booking button only if viewing a doctor profile and user is a patient */}
                {profileUser.role === 'VERIFIED_DOCTOR' && currentUserRole === 'PATIENT' && (
                  <button
                    onClick={() => setShowBooking(!showBooking)}
                    className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600"
                  >
                    {showBooking ? 'Hide Booking' : 'Book Appointment'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Appointment Booking Section */}
          {showBooking && profileUser.role === 'VERIFIED_DOCTOR' && currentUserRole === 'PATIENT' && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <AppointmentCalendar
                doctorId={doctorId}
                patientId={effectiveCurrentUserId}
                onBookingComplete={() => {
                  setShowBooking(false)
                  alert('Appointment request sent!')
                }}
              />
            </div>
          )}

          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="flex gap-6 border-b border-gray-200">
              <button className="px-4 py-2 font-semibold border-b-2 border-[#FF4500]">Posts</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50">Comments</button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-50">About</button>
            </div>

            <div className="mt-6">
              <p className="text-gray-600">No posts yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}