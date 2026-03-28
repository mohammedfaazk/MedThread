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
import { DoctorPublicStats } from '@/components/analytics/DoctorPublicStats'
import { DoctorProfileGraphs } from '@/components/doctor/DoctorProfileGraphs'
import { AnalyticsTracker } from '@/lib/analytics'
import { ReviewsList } from '@/components/doctor/ReviewsList'
import { DoctorIdentityCard3D } from '@/components/doctor/DoctorIdentityCard3D'
import '@/styles/glassmorphic-analytics.css'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [showBooking, setShowBooking] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about' | 'reviews'>('posts')
  const [userPosts, setUserPosts] = useState<any[]>([])
  const [userComments, setUserComments] = useState<any[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const { user: currentUser, role: currentUserRole, profileId: currentProfileId, loading: contextLoading } = useUser()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const effectiveCurrentUserId = currentProfileId || currentUser?.id;

  useEffect(() => {
    fetchProfile()
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('[Profile] Loading timeout - forcing completion');
        setLoading(false);
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [params.username])

  useEffect(() => {
    if (profileUser && activeTab !== 'about') {
      fetchUserContent()
    }
  }, [profileUser, activeTab])

  const fetchUserContent = async () => {
    if (!profileUser?.id) return
    
    setLoadingContent(true)
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      
      if (activeTab === 'posts') {
        // Fetch user's posts
        const postsResponse = await axios.get(`${API_URL}/api/v1/posts?authorId=${profileUser.id}`)
        // Posts API returns array directly, not wrapped in success object
        const posts = Array.isArray(postsResponse.data) ? postsResponse.data : []
        setUserPosts(posts)
      } else if (activeTab === 'comments') {
        // Fetch user's comments
        const commentsResponse = await axios.get(`${API_URL}/api/v1/comments?authorId=${profileUser.id}`)
        // Comments API returns { success: true, data: [...] }
        if (commentsResponse.data.success) {
          setUserComments(commentsResponse.data.data || [])
        } else {
          setUserComments([])
        }
      }
    } catch (error) {
      console.error('Error fetching user content:', error)
      // Set empty arrays on error
      if (activeTab === 'posts') {
        setUserPosts([])
      } else if (activeTab === 'comments') {
        setUserComments([])
      }
    } finally {
      setLoadingContent(false)
    }
  }

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

  if (loading) {
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top Section with 3D Card for Doctors */}
          {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') ? (
            <div className="flex gap-6 items-start flex-col lg:flex-row">
              {/* Left Column - Main Profile Card */}
              <div className="flex-1 w-full lg:w-auto">
                <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl transition-all">
                  {/* Profile Header */}
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold mb-3 text-gray-900">
                      Dr. {profileUser.username || profileUser.full_name || profileUser.name || params.username}
                    </h1>
                    <div className="flex flex-wrap gap-6 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-blue-600">
                          <CountUpNumber value={profileUser.totalKarma || 0} />
                        </span>
                        <span className="text-gray-600 font-medium">Karma</span>
                      </div>
                      {profileUser.yearsOfExperience && (
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold text-blue-600">
                            <CountUpNumber value={profileUser.yearsOfExperience} />
                          </span>
                          <span className="text-gray-600 font-medium">years experience</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  {profileUser.bio && (
                    <div className="bg-white/50 rounded-xl p-5 border border-gray-200 mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">About</h3>
                      <p className="text-gray-700 leading-relaxed">{profileUser.bio}</p>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {(profileUser.specialty || profileUser.specialization) && (
                      <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Specialty</div>
                        <div className="text-gray-900 font-semibold">{profileUser.specialty || profileUser.specialization}</div>
                      </div>
                    )}
                    {profileUser.hospitalAffiliation && (
                      <div className="bg-white/50 rounded-xl p-4 border border-gray-200">
                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">Hospital</div>
                        <div className="text-gray-900 font-semibold">{profileUser.hospitalAffiliation}</div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {effectiveCurrentUserId && effectiveCurrentUserId !== profileUser.id && (
                      <>
                        <Link href={`/profile?tab=consultation&doctor=${doctorId}`}>
                          <button 
                            className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                            onClick={async () => {
                              const token = localStorage.getItem('auth_token');
                              if (token && effectiveCurrentUserId) {
                                await AnalyticsTracker.trackCommentConversion({
                                  commentId: 'profile_message_click',
                                  doctorId: profileUser.id,
                                  patientId: effectiveCurrentUserId,
                                  postId: 'profile_message_click',
                                  action: 'message_click'
                                }, token);
                              }
                            }}
                          >
                            💬 Message Doctor
                          </button>
                        </Link>

                        {currentUserRole === 'PATIENT' && (
                          <button
                            onClick={() => setShowBooking(!showBooking)}
                            className="px-6 py-2.5 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                          >
                            📅 {showBooking ? 'Hide Booking' : 'Book Appointment'}
                          </button>
                        )}

                        <ReportButton 
                          type="user" 
                          targetId={profileUser.id}
                          targetTitle={`User: ${profileUser.username || profileUser.full_name || profileUser.name || params.username}`}
                          className="px-6 py-2.5 border-2 border-gray-300 rounded-full font-semibold hover:bg-gray-50 transition-colors"
                        />
                      </>
                    )}
                    
                    {effectiveCurrentUserId && effectiveCurrentUserId === profileUser.id && (
                      <Link href="/profile">
                        <button className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg">
                          ✏️ Edit Profile
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - 3D Identity Card (Separate Section) */}
              <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                <DoctorIdentityCard3D 
                  doctor={{
                    id: profileUser.id,
                    name: profileUser.username || profileUser.full_name || profileUser.name,
                    specialty: profileUser.specialty || profileUser.specialization,
                    clinic_name: profileUser.hospitalAffiliation,
                    yearsOfExperience: profileUser.yearsOfExperience,
                    profile_photo: profileUser.avatar ? (getImageUrl(profileUser.avatar) || undefined) : undefined,
                    verification_status: profileUser.verification_status,
                    role: profileUser.role,
                    medicalLicenseNumber: profileUser.medicalLicenseNumber,
                    totalKarma: profileUser.totalKarma
                  }}
                />
              </div>
            </div>
          ) : (
            /* Regular Profile Card for Patients */
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
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{(profileUser.username || profileUser.full_name || profileUser.name || params.username)[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {profileUser.username || profileUser.full_name || profileUser.name || `u/${params.username}`}
                  </h1>
                  <div className="flex gap-6 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-semibold">
                        <CountUpNumber value={profileUser.totalKarma || 0} />
                      </span> Karma
                    </div>
                    {profileUser.role === 'PATIENT' && (
                      <div className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-bold uppercase">
                        Patient
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {effectiveCurrentUserId && effectiveCurrentUserId !== profileUser.id && (
                      <>
                        <Link href={`/profile?tab=consultation&doctor=${doctorId}`}>
                          <button className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50">
                            Message
                          </button>
                        </Link>
                        <ReportButton 
                          type="user" 
                          targetId={profileUser.id}
                          targetTitle={`User: ${profileUser.username || profileUser.full_name || profileUser.name || params.username}`}
                          className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50"
                        />
                      </>
                    )}
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
            </div>
          )}

          {/* Stats and Analytics Section - Full Width */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-lg hover:shadow-xl transition-all mt-6">
            {/* Doctor Analytics Stats - Only show for doctors */}
            {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
              <div className="mb-6">
                <DoctorPublicStats doctorId={profileUser.id} />
              </div>
            )}

            {/* Doctor Profile Graphs - Only show for doctors */}
            {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
              <div className="border-t border-gray-200 pt-6">
                <DoctorProfileGraphs doctorId={profileUser.id} />
              </div>
            )}

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
                <button 
                  onClick={() => setActiveTab('posts')}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    activeTab === 'posts' 
                      ? 'border-[#00BCD4] text-[#00BCD4]' 
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Posts
                </button>
                <button 
                  onClick={() => setActiveTab('comments')}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    activeTab === 'comments' 
                      ? 'border-[#00BCD4] text-[#00BCD4]' 
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Comments
                </button>
                <button 
                  onClick={() => setActiveTab('about')}
                  className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                    activeTab === 'about' 
                      ? 'border-[#00BCD4] text-[#00BCD4]' 
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  About
                </button>
                {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
                  <button 
                    onClick={() => setActiveTab('reviews')}
                    className={`px-4 py-2 font-semibold border-b-2 transition-colors ${
                      activeTab === 'reviews' 
                        ? 'border-[#00BCD4] text-[#00BCD4]' 
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Reviews
                  </button>
                )}
              </div>

              <div className="mt-6">
                {/* Posts Tab Content */}
                {activeTab === 'posts' && (
                  <div>
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Loading posts...</span>
                      </div>
                    ) : userPosts.length > 0 ? (
                      <div className="space-y-4">
                        {userPosts.map((post) => (
                          <div key={post.id} className="bg-white/60 rounded-lg p-4 border border-gray-200">
                            <Link href={`/post/${post.id}`} className="hover:text-blue-600">
                              <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                            </Link>
                            <p className="text-gray-600 text-sm mb-2">
                              {post.content?.substring(0, 200)}
                              {post.content?.length > 200 && '...'}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              <span>👍 {post.upvotes || 0}</span>
                              <span>💬 {post.commentCount || 0}</span>
                              {post.community && (
                                <Link href={`/m/${post.community.name}`} className="text-blue-600 hover:underline">
                                  m/{post.community.name}
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No posts yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {profileUser.username || 'This user'} hasn't created any posts.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Comments Tab Content */}
                {activeTab === 'comments' && (
                  <div>
                    {loadingContent ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-2 text-gray-600">Loading comments...</span>
                      </div>
                    ) : userComments.length > 0 ? (
                      <div className="space-y-4">
                        {userComments.map((comment) => (
                          <div key={comment.id} className="bg-white/60 rounded-lg p-4 border border-gray-200">
                            <p className="text-gray-800 mb-2">{comment.content}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                              <span>👍 {comment.upvotes || 0}</span>
                              {comment.post && (
                                <Link href={`/post/${comment.post.id}`} className="text-blue-600 hover:underline">
                                  on "{comment.post.title?.substring(0, 50)}..."
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600">No comments yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {profileUser.username || 'This user'} hasn't made any comments.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* About Tab Content */}
                {activeTab === 'about' && (
                  <div className="space-y-6">
                    <div className="bg-white/60 rounded-lg p-6 border border-gray-200">
                      <h3 className="font-semibold text-lg mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Username</label>
                          <p className="text-gray-800">{profileUser.username || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Role</label>
                          <p className="text-gray-800">
                            {profileUser.role === 'VERIFIED_DOCTOR' ? 'Verified Doctor' : 
                             profileUser.role === 'DOCTOR' ? 'Doctor' : 'Patient'}
                          </p>
                        </div>
                        {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
                          <>
                            {(profileUser.specialty || profileUser.specialization) && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Specialty</label>
                                <p className="text-gray-800">{profileUser.specialty || profileUser.specialization}</p>
                              </div>
                            )}
                            {profileUser.yearsOfExperience && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Experience</label>
                                <p className="text-gray-800">{profileUser.yearsOfExperience} years</p>
                              </div>
                            )}
                            {profileUser.hospitalAffiliation && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">Hospital</label>
                                <p className="text-gray-800">{profileUser.hospitalAffiliation}</p>
                              </div>
                            )}
                            {profileUser.medicalLicenseNumber && (
                              <div>
                                <label className="text-sm font-medium text-gray-600">License Number</label>
                                <p className="text-gray-800">{profileUser.medicalLicenseNumber}</p>
                              </div>
                            )}
                            {profileUser.clinicAddress && (
                              <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Clinic Address</label>
                                <p className="text-gray-800">{profileUser.clinicAddress}</p>
                              </div>
                            )}
                          </>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-600">Member Since</label>
                          <p className="text-gray-800">
                            {profileUser.createdAt 
                              ? new Date(profileUser.createdAt).toLocaleDateString()
                              : 'Not available'
                            }
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Total Karma</label>
                          <p className="text-gray-800">
                            <CountUpNumber value={profileUser.totalKarma || 0} />
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bio section if available */}
                    {profileUser.bio && (
                      <div className="bg-white/60 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4">Bio</h3>
                        <p className="text-gray-800 whitespace-pre-wrap">{profileUser.bio}</p>
                      </div>
                    )}

                    {/* Education section for doctors */}
                    {(profileUser.role === 'VERIFIED_DOCTOR' || profileUser.role === 'DOCTOR') && (
                      <div className="bg-white/60 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-lg mb-4">Education & Qualifications</h3>
                        <div className="space-y-3">
                          {profileUser.medicalUniversity && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Medical University</label>
                              <p className="text-gray-800">{profileUser.medicalUniversity}</p>
                            </div>
                          )}
                          {profileUser.graduationYear && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">Graduation Year</label>
                              <p className="text-gray-800">{profileUser.graduationYear}</p>
                            </div>
                          )}
                          {profileUser.licenseIssuingAuthority && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">License Authority</label>
                              <p className="text-gray-800">{profileUser.licenseIssuingAuthority}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Reviews Tab Content */}
                {activeTab === 'reviews' && (
                  <div>
                    <ReviewsList doctorId={profileUser.id} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </IridescenceLayout>
  )
}