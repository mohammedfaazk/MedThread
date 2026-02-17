'use client'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import Link from 'next/link'
import { AppointmentCalendar } from '@/components/Board/AppointmentCalendar'
import { useUser } from '@/context/UserContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ProfileTabs } from '@/components/ProfileTabs'
import { getImageUrl } from '@/lib/imageUrl'

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
      console.log('[Profile] Fetching profile for:', params.username);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // 1. Try fetching from new profile API endpoint
      try {
        const response = await axios.get(`${API_URL}/api/profile/${params.username}`);
        
        if (response.data.success) {
          const userData = response.data.data;
          console.log('[Profile] Found user from API:', userData);
          setProfileUser(userData);
          setLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.warn('[Profile] Profile API fetch failed:', apiError.response?.status, apiError.response?.data);
        
        // If it's a 404, the user doesn't exist
        if (apiError.response?.status === 404) {
          console.warn('[Profile] User not found:', params.username);
          setProfileUser(null);
          setLoading(false);
          return;
        }
      }

      // 2. Fallback: Try fetching verified doctors list
      try {
        const response = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`);
        const doctorsList = response.data?.data?.doctors || response.data?.doctors || [];
        
        const matchedDoctor = doctorsList.find((doc: any) => 
          doc.id === params.username || doc.username === params.username
        );
        
        if (matchedDoctor) {
          console.log('[Profile] Found verified doctor from list:', matchedDoctor);
          setProfileUser({ ...matchedDoctor, role: 'VERIFIED_DOCTOR' });
          setLoading(false);
          return;
        }
      } catch (doctorError) {
        console.warn('[Profile] Doctor verification API failed:', doctorError);
      }

      // 3. Final fallback: Try doctor_data.json
      try {
        const response = await fetch('/doctor_data.json');
        if (response.ok) {
          const doctorData = await response.json();
          const matchedDoctor = doctorData.find((doc: any) => 
            doc.id === params.username || doc.user_id === params.username || doc.username === params.username
          );
          if (matchedDoctor) {
            console.log('[Profile] Found doctor in fallback JSON:', matchedDoctor);
            setProfileUser({ ...matchedDoctor, role: 'VERIFIED_DOCTOR' });
            setLoading(false);
            return;
          }
        }
      } catch (jsonError) {
        console.warn('[Profile] Failed to load doctor_data.json:', jsonError);
      }

      // If we get here, user was not found
      console.warn('[Profile] No user found for username:', params.username);
      setProfileUser(null);
    } catch (error) {
      console.error('[Profile] Error fetching profile:', error);
      setProfileUser(null);
    } finally {
      setLoading(false);
    }
  }

  if (loading || contextLoading) return <div className="p-8">Loading profile...</div>
  if (!profileUser) return <div className="p-8 text-center text-gray-500">User not found</div>

  const doctorId = profileUser.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarEnhanced />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Banner Section */}
          <div className="relative h-48 sm:h-56 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            {profileUser.banner && (
              <img
                src={getImageUrl(profileUser.banner) || ''}
                alt="Profile Banner"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Info Section */}
          <div className="px-6 pb-6">
            {/* Avatar - Positioned to overlap banner */}
            <div className="-mt-16 mb-4">
              <div className="relative z-10 inline-block">
                {profileUser.avatar ? (
                  <img
                    src={getImageUrl(profileUser.avatar) || ''}
                    alt={profileUser.username || profileUser.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-lg border-4 border-white">
                    {(profileUser.username || profileUser.full_name || profileUser.name || params.username)[0].toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Name and Username */}
            <div className="mb-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {profileUser.role === 'VERIFIED_DOCTOR' 
                  ? `Dr. ${profileUser.username || profileUser.full_name || profileUser.name || params.username}`
                  : (profileUser.full_name || profileUser.name || profileUser.username || params.username)
                }
              </h1>
              <p className="text-gray-600 text-base">@{profileUser.username || params.username}</p>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <p className="text-gray-700 mb-4 text-base leading-relaxed max-w-2xl">{profileUser.bio}</p>
            )}

            {/* Stats and Badges */}
            <div className="flex flex-wrap items-center gap-3 text-sm mb-4">
              {/* Karma */}
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900">{profileUser.totalKarma || 0}</span>
                <span className="text-gray-600">Karma</span>
              </div>

              {/* Separator */}
              <span className="text-gray-300">•</span>

              {/* Verified Doctor Badge */}
              {profileUser.role === 'VERIFIED_DOCTOR' && (
                <>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Doctor
                  </span>
                  <span className="text-gray-300">•</span>
                </>
              )}

              {/* Specialty */}
              {(profileUser.specialty || profileUser.specialization) && (
                <>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {profileUser.specialty || profileUser.specialization}
                  </span>
                  <span className="text-gray-300">•</span>
                </>
              )}

              {/* Years of Experience */}
              {profileUser.yearsOfExperience && (
                <>
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-semibold text-gray-900">{profileUser.yearsOfExperience}</span>
                    <span>years experience</span>
                  </div>
                  <span className="text-gray-300">•</span>
                </>
              )}

              {/* Hospital Affiliation */}
              {profileUser.hospitalAffiliation && (
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span>🏥</span>
                  <span className="font-medium">{profileUser.hospitalAffiliation}</span>
                </div>
              )}
            </div>

            {/* Action Buttons - Below stats for better visibility */}
            <div className="flex flex-wrap gap-3">
              <Link href={`/profile?tab=consultation&doctor=${doctorId}`}>
                <button className="px-5 py-2.5 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 hover:border-gray-400 transition text-sm flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </button>
              </Link>

              {profileUser.role === 'VERIFIED_DOCTOR' && currentUserRole === 'PATIENT' && (
                <button
                  onClick={() => setShowBooking(!showBooking)}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition text-sm flex items-center gap-2 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {showBooking ? 'Hide Booking' : 'Book Appointment'}
                </button>
              )}
            </div>
          </div>

          {/* Appointment Booking Section */}
          {showBooking && profileUser.role === 'VERIFIED_DOCTOR' && currentUserRole === 'PATIENT' && (
            <div className="px-6 pb-6 border-t border-gray-200 pt-6">
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

          {/* Profile Tabs */}
          <div className="border-t border-gray-200">
            <ProfileTabs username={params.username} profileUser={profileUser} />
          </div>
        </div>
      </div>
    </div>
  )
}