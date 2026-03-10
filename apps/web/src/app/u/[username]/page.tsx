'use client'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import { AppointmentCalendar } from '@/components/Board/AppointmentCalendar'
import { useUser } from '@/context/UserContext'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ReportButton from '@/components/ReportButton'
import IridescenceLayout from '@/components/IridescenceLayout'
import { CountUpNumber } from '@/components/enhancements/CountUpNumber'
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
      
      // Normalize username - replace dots with underscores for database lookup
      const normalizedUsername = params.username.replace(/\./g, '_');
      console.log('[Profile] Normalized username:', normalizedUsername);
      
      // 1. Try fetching from API first (all users - doctors and patients)
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        
        // Try to get user by username from the users API
        console.log('[Profile] Trying API endpoint:', `${API_URL}/api/v2/users/by-username/${normalizedUsername}`);
        const userResponse = await axios.get(`${API_URL}/api/v2/users/by-username/${normalizedUsername}`);
        console.log('[Profile] API Response:', userResponse.data);
        
        if (userResponse.data.success && userResponse.data.data) {
          const userData = userResponse.data.data;
          console.log('[Profile] Found user from API:', userData);
          setProfileUser({ 
            ...userData, 
            role: userData.role || 'PATIENT',
            username: userData.username,
            full_name: userData.username,
            totalKarma: userData.totalKarma || 0
          });
          setLoading(false);
          return;
        }
      } catch (apiError: any) {
        console.error('[Profile] User API fetch failed:', apiError.response?.data || apiError.message);
        
        // If username lookup fails, try by ID
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          console.log('[Profile] Trying to fetch by ID:', params.username);
          
          const idResponse = await axios.get(`${API_URL}/api/v2/users/${params.username}`);
          if (idResponse.data.success && idResponse.data.data) {
            const userData = idResponse.data.data;
            console.log('[Profile] Found user by ID:', userData);
            setProfileUser({ 
              ...userData, 
              role: userData.role || 'PATIENT',
              username: userData.username || params.username,
              full_name: userData.username || params.username,
              totalKarma: userData.totalKarma || 0
            });
            setLoading(false);
            return;
          }
        } catch (idError: any) {
          console.error('[Profile] ID lookup also failed:', idError.response?.data || idError.message);
        }
      }

      // 2. Try fetching verified doctors from verification API
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`);
        const doctorsList = response.data?.data?.doctors || response.data?.doctors || [];
        
        // Find doctor by ID or username
        const matchedDoctor = doctorsList.find((doc: any) => 
          doc.id === params.username || doc.username === params.username
        );
        
        if (matchedDoctor) {
          console.log('[Profile] Found verified doctor from API:', matchedDoctor);
          setProfileUser({ ...matchedDoctor, role: 'VERIFIED_DOCTOR' });
          setLoading(false);
          return;
        }
      } catch (apiError) {
        console.warn('[Profile] Doctor verification API fetch failed:', apiError);
      }

      // 3. Try finding as a doctor in Supabase by ID or user_id (only if Supabase is available)
      if (typeof supabase.from === 'function') {
        let { data: profile, error: dError } = await supabase
          .from('doctors')
          .select('*')
          .or(`id.eq.${params.username},user_id.eq.${params.username}`)
          .maybeSingle()

        let role: 'VERIFIED_DOCTOR' | 'PATIENT' = 'VERIFIED_DOCTOR'

        // 4. If not found in Supabase, try doctor_data.json fallback
        if (!profile) {
          try {
            const response = await fetch('/doctor_data.json');
            if (response.ok) {
              const doctorData = await response.json();
              const matchedDoctor = doctorData.find((doc: any) => 
                doc.id === params.username || doc.user_id === params.username || doc.username === normalizedUsername
              );
              if (matchedDoctor) {
                profile = matchedDoctor;
                console.log('[Profile] Found doctor in fallback JSON:', profile);
              }
            }
          } catch (jsonError) {
            console.warn('[Profile] Failed to load doctor_data.json:', jsonError);
          }
        }

        if (profile) {
          console.log('[Profile] Found profile:', profile);
          setProfileUser({ ...profile, role })
          setLoading(false);
          return;
        }
      }

      // If we reach here, user was not found
      console.warn('[Profile] No user found for username:', params.username, 'or normalized:', normalizedUsername);
      setProfileUser(null);
    } catch (error) {
      console.error('[Profile] Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || contextLoading) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <Navbar />
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-700">Loading profile...</p>
            </div>
          </div>
        </div>
      </IridescenceLayout>
    )
  }
  
  if (!profileUser) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <Navbar />
          <div className="max-w-5xl mx-auto px-6 py-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg text-center">
              <p className="text-xl font-semibold text-gray-800">User not found</p>
              <p className="mt-2 text-gray-600">The user "{params.username}" does not exist.</p>
            </div>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  const doctorId = profileUser.id;

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
              {profileUser.avatar ? (
                <img
                  src={getImageUrl(profileUser.avatar) || ''}
                  alt={profileUser.username || 'User'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to initial if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span>{(profileUser.username || profileUser.full_name || profileUser.name || params.username)[0].toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR'
                  ? `Dr. ${profileUser.username || profileUser.full_name || profileUser.name || params.username}`
                  : (profileUser.username || profileUser.full_name || profileUser.name || `u/${params.username}`)
                }
              </h1>
              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-semibold">
                    <CountUpNumber value={profileUser.totalKarma || 0} />
                  </span> Karma
                </div>
                
                {/* Doctor-specific info */}
                {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
                  <>
                    {profileUser.yearsOfExperience && (
                      <div>
                        <span className="font-semibold">
                          <CountUpNumber value={profileUser.yearsOfExperience} />
                        </span> years experience
                      </div>
                    )}
                    {profileUser.hospitalAffiliation && (
                      <div>
                        🏥 <span className="font-semibold">{profileUser.hospitalAffiliation}</span>
                      </div>
                    )}
                    {(profileUser.specialty || profileUser.specialization) && (
                      <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-bold uppercase">
                        {profileUser.specialty || profileUser.specialization}
                      </div>
                    )}
                  </>
                )}
                
                {/* Role badges */}
                {profileUser.role === 'VERIFIED_DOCTOR' && (
                  <div className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold uppercase flex items-center gap-1">
                    ✓ Verified Doctor
                  </div>
                )}
                {profileUser.role === 'PATIENT' && (
                  <div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">
                    Patient
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                {/* Only show action buttons if NOT viewing own profile */}
                {effectiveCurrentUserId && effectiveCurrentUserId !== profileUser.id && (
                  <>
                    {/* Message button */}
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

                    {/* Report button */}
                    <ReportButton 
                      type="user" 
                      targetId={profileUser.id}
                      targetTitle={`User: ${profileUser.username || profileUser.full_name || profileUser.name || params.username}`}
                      className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50"
                    />
                  </>
                )}
                
                {/* Show "Edit Profile" button if viewing own profile */}
                {effectiveCurrentUserId && effectiveCurrentUserId === profileUser.id && (
                  <Link href="/profile">
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600">
                      Edit Profile
                    </button>
                  </Link>
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
              <button className="px-4 py-2 font-semibold border-b-2 border-[#00BCD4]">Posts</button>
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
    </IridescenceLayout>
  )
}