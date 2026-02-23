'use client'
import { Sidebar } from '@/components/Sidebar'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { useUser } from '@/context/UserContext'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { 
  CheckCircle2, Calendar, MessageCircle, UserPlus, 
  Briefcase, MapPin, FileText, Users, Award, TrendingUp
} from 'lucide-react'
import BadgeDisplay from '@/components/badges/BadgeDisplay'
import BadgeStats from '@/components/badges/BadgeStats'
import BlockButton from '@/components/BlockButton'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const router = useRouter()
  const { user: currentUser, role: currentUserRole, profileId: currentProfileId, loading: contextLoading } = useUser()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')

  const effectiveCurrentUserId = currentProfileId || currentUser?.id;

  useEffect(() => {
    fetchProfile()
  }, [params.username])

  // Check if already following
  useEffect(() => {
    if (profileUser && currentProfileId) {
      checkFollowStatus()
    }
  }, [profileUser, currentProfileId])

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token || !profileUser) return

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await axios.get(`${API_URL}/api/follow/${profileUser.id}/check`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (response.data.success) {
        setIsFollowing(response.data.data.isFollowing)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

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
          setProfileUser({ ...matchedDoctor, role: 'DOCTOR', doctorVerificationStatus: 'APPROVED' });
          setLoading(false);
          return;
        }
      } catch (doctorError) {
        console.warn('[Profile] Doctor verification API failed:', doctorError);
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

  const handleFollow = async () => {
    try {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
      if (!token) {
        alert('Please log in to follow users')
        return
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (isFollowing) {
        await axios.delete(`${API_URL}/api/follow/${profileUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsFollowing(false)
      } else {
        await axios.post(`${API_URL}/api/follow/${profileUser.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIsFollowing(true)
      }
    } catch (error: any) {
      console.error('Error following/unfollowing:', error)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message
      if (error.response?.status === 401) {
        alert('Please log in to follow users')
      } else {
        alert(`Failed to follow/unfollow: ${errorMessage}`)
      }
    }
  }

  const handleMessage = () => {
    router.push('/chat')
  }

  const handleBookAppointment = () => {
    router.push('/appointments')
  }

  if (loading || contextLoading) {
    return (
      <>
        <NavbarEnhanced />
        <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e3f2fd] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    )
  }

  if (!profileUser) {
    return (
      <>
        <NavbarEnhanced />
        <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e3f2fd] flex">
          <Sidebar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
              <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const isDoctor = profileUser.role === 'DOCTOR' && profileUser.doctorVerificationStatus === 'APPROVED'

  return (
    <>
      <NavbarEnhanced />
      <div className="min-h-screen bg-gradient-to-br from-[#f5f1e8] to-[#e3f2fd] flex">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
                {(profileUser.username || params.username).charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold">
                    {isDoctor ? `Dr. ${profileUser.username}` : profileUser.username}
                  </h1>
                  {isDoctor && (
                    <CheckCircle2 className="w-8 h-8 text-blue-300 fill-blue-300/20" />
                  )}
                </div>
                
                <p className="text-xl text-blue-100 mb-4">
                  {profileUser.specialty || 'MedThread User'}
                  {profileUser.subSpecialty && ` • ${profileUser.subSpecialty}`}
                </p>

                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  {profileUser.yearsOfExperience && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{profileUser.yearsOfExperience} years experience</span>
                    </div>
                  )}
                  {profileUser.hospitalAffiliation && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{profileUser.hospitalAffiliation}</span>
                    </div>
                  )}
                  {profileUser.totalKarma !== undefined && (
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      <span>{profileUser.totalKarma} Karma</span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {profileUser.bio && (
                  <p className="text-blue-100 mb-6 max-w-2xl">{profileUser.bio}</p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  <button 
                    onClick={handleFollow}
                    className="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition flex items-center gap-2 shadow-lg"
                  >
                    <UserPlus className="w-5 h-5" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  
                  <button 
                    onClick={handleMessage}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-400 transition flex items-center gap-2 shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </button>
                  
                  {isDoctor && (
                    <button 
                      onClick={handleBookAppointment}
                      className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-400 transition flex items-center gap-2 shadow-lg"
                    >
                      <Calendar className="w-5 h-5" />
                      Book Appointment
                    </button>
                  )}
                  
                  {currentProfileId && currentProfileId !== profileUser.id && (
                    <BlockButton 
                      userId={profileUser.id} 
                      username={profileUser.username}
                      onBlockChange={(blocked) => {
                        if (blocked) {
                          setIsFollowing(false)
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-5xl mx-auto px-4 -mt-8">
          {/* Badge Preview */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-lg mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                Recent Badges
              </h3>
              <button
                onClick={() => setActiveTab('badges')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            <BadgeDisplay userId={profileUser.id} limit={6} />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">Posts</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profileUser._count?.posts || 0}</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Comments</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profileUser._count?.comments || 0}</p>
            </div>
            
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-gray-600">
                <UserPlus className="w-5 h-5" />
                <span className="text-sm">Followers</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{profileUser._count?.followers || 0}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg mb-6">
            <div className="border-b border-gray-200/30">
              <nav className="flex gap-8 px-6">
                {['posts', 'comments', 'badges', 'about'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 border-b-2 font-medium transition ${
                      activeTab === tab
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'posts' && (
                <div className="text-center text-gray-600 py-8">
                  <p>Posts will be displayed here</p>
                </div>
              )}
              {activeTab === 'comments' && (
                <div className="text-center text-gray-600 py-8">
                  <p>Comments will be displayed here</p>
                </div>
              )}
              {activeTab === 'badges' && (
                <div className="space-y-6">
                  <BadgeStats userId={profileUser.id} />
                  <BadgeDisplay userId={profileUser.id} showAll={true} />
                </div>
              )}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  {profileUser.bio && (
                    <div>
                      <h3 className="font-semibold mb-2">Bio</h3>
                      <p className="text-gray-700">{profileUser.bio}</p>
                    </div>
                  )}
                  {isDoctor && (
                    <>
                      {profileUser.specialty && (
                        <div>
                          <h3 className="font-semibold mb-2">Specialty</h3>
                          <p className="text-gray-700">{profileUser.specialty}</p>
                        </div>
                      )}
                      {profileUser.hospitalAffiliation && (
                        <div>
                          <h3 className="font-semibold mb-2">Hospital</h3>
                          <p className="text-gray-700">{profileUser.hospitalAffiliation}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>
    </>
  )
}
