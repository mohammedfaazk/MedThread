'use client'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import Link from 'next/link'
import { AppointmentCalendar } from '@/components/Board/AppointmentCalendar'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useEffect, useState } from 'react'
import axios from 'axios'
import ReportButton from '@/components/ReportButton'
import { getImageUrl } from '@/lib/imageUrl'
import { MessageCircle, Calendar, CheckCircle2 } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [showBooking, setShowBooking] = useState(false)
  const { user: currentUser, role: currentUserRole } = useJWTAuth()
  const [profileUser, setProfileUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [posts, setPosts] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'comments' | 'about'>('posts')

  useEffect(() => {
    fetchProfile()
  }, [params.username])

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile/${params.username}`)
      
      if (response.data.success) {
        setProfileUser(response.data.data)
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error)
      if (error.response?.status === 404) {
        setProfileUser(null)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/profile/${params.username}/posts`)
      if (response.data.success) {
        setPosts(response.data.data.posts)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    }
  }

  useEffect(() => {
    if (profileUser && activeTab === 'posts') {
      fetchPosts()
    }
  }, [profileUser, activeTab])

  if (loading) return <div className="min-h-screen"><NavbarEnhanced /><div className="p-8 text-center">Loading profile...</div></div>
  if (!profileUser) return <div className="min-h-screen"><NavbarEnhanced /><div className="p-8 text-center text-gray-500">User not found</div></div>

  const isOwnProfile = currentUser?.id === profileUser.id
  const isDoctor = profileUser.role === 'DOCTOR' || profileUser.doctorVerificationStatus === 'APPROVED'
  const isVerifiedDoctor = profileUser.doctorVerificationStatus === 'APPROVED'

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarEnhanced />

      <div className="max-w-5xl mx-auto">
        {/* Banner */}
        <div className="relative h-56 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden">
          {profileUser.banner && (
            <img
              src={getImageUrl(profileUser.banner)}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-6 pb-6">
            {/* Avatar overlapping banner */}
            <div className="flex items-end gap-6 -mt-16 mb-4 relative z-10">
              {profileUser.avatar ? (
                <img
                  src={getImageUrl(profileUser.avatar)}
                  alt={profileUser.username}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-5xl font-bold">
                  {profileUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* Name and Username */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {isVerifiedDoctor ? `Dr. ${profileUser.username}` : profileUser.username}
                </h1>
                {isVerifiedDoctor && (
                  <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
                )}
              </div>
              <p className="text-gray-600">u/{profileUser.username}</p>
            </div>

            {/* Bio */}
            {profileUser.bio && (
              <p className="text-gray-700 mb-4 max-w-2xl">{profileUser.bio}</p>
            )}

            {/* Stats */}
            <div className="flex gap-6 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-semibold text-gray-900">{profileUser.totalKarma || 0}</span> Karma
              </div>
              <div>
                <span className="font-semibold text-gray-900">{profileUser.postCount || 0}</span> Posts
              </div>
              <div>
                <span className="font-semibold text-gray-900">{profileUser.commentCount || 0}</span> Comments
              </div>
              {isDoctor && profileUser.specialty && (
                <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                  {profileUser.specialty}
                </div>
              )}
              {isVerifiedDoctor && (
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Doctor
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && (
              <div className="flex gap-3">
                <Link href={`/chat?user=${profileUser.username}`}>
                  <button className="flex items-center gap-2 px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50 transition">
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </Link>

                {isVerifiedDoctor && currentUserRole === 'PATIENT' && (
                  <button
                    onClick={() => setShowBooking(!showBooking)}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition"
                  >
                    <Calendar className="w-4 h-4" />
                    {showBooking ? 'Hide Booking' : 'Book Appointment'}
                  </button>
                )}

                <ReportButton 
                  type="user" 
                  targetId={profileUser.id}
                  targetTitle={`User: ${profileUser.username}`}
                  className="px-6 py-2 border border-gray-300 rounded-full font-semibold hover:bg-gray-50 transition"
                />
              </div>
            )}
          </div>
        </div>

        {/* Appointment Booking Section */}
        {showBooking && isVerifiedDoctor && currentUserRole === 'PATIENT' && currentUser && (
          <div className="bg-white border-b border-gray-200 px-6 py-6">
            <AppointmentCalendar
              doctorId={profileUser.id}
              patientId={currentUser.id}
              onBookingComplete={() => {
                setShowBooking(false)
                alert('Appointment request sent!')
              }}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white px-6">
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === 'posts'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Posts
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === 'comments'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Comments
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 font-semibold transition ${
                activeTab === 'about'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white min-h-[400px] px-6 py-6">
          {activeTab === 'posts' && (
            <div>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{post._count?.comments || 0} comments</span>
                          <span>{post.upvotes || 0} upvotes</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">No posts yet</p>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div>
              <p className="text-gray-600 text-center py-8">No comments yet</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              {profileUser.bio ? (
                <p className="text-gray-700 mb-6">{profileUser.bio}</p>
              ) : (
                <p className="text-gray-600 mb-6">No bio provided</p>
              )}
              
              {isDoctor && (
                <div className="space-y-3">
                  {profileUser.specialty && (
                    <div>
                      <span className="font-semibold text-gray-900">Specialty:</span>{' '}
                      <span className="text-gray-700">{profileUser.specialty}</span>
                    </div>
                  )}
                  {isVerifiedDoctor && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <span className="text-green-700 font-semibold">Verified Healthcare Professional</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}