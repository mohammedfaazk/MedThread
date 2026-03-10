'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { DoctorProfile } from '@/components/DoctorProfile'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Calendar, 
  MessageSquare, 
  Activity,
  Clock,
  Loader2
} from 'lucide-react'
import { getImageUrl } from '@/lib/imageUrl'
import Link from 'next/link'
import axios from 'axios'
import IridescenceLayout from '@/components/IridescenceLayout'
import { CountUpNumber } from '@/components/enhancements/CountUpNumber'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface PatientStats {
  totalAppointments: number
  upcomingAppointments: number
  completedAppointments: number
  totalPosts: number
  totalComments: number
  karma: number
  joinedDate: string
}

export default function ProfilePage() {
  const { user, role, loading: userLoading, isDoctorVerified, isDoctorPending } = useJWTAuth()
  const router = useRouter()
  const [stats, setStats] = useState<PatientStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Check if user is a doctor (verified or unverified)
  const isDoctor = role === 'DOCTOR' || role === 'VERIFIED_DOCTOR' || isDoctorVerified || isDoctorPending

  useEffect(() => {
    if (user && !isDoctor) {
      fetchPatientStats()
    }
  }, [user, isDoctor])

  const fetchPatientStats = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('auth_token')

      if (!token) {
        router.push('/login')
        return
      }

      // Fetch patient statistics
      const response = await axios.get(`${API_URL}/api/profile/me/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching patient stats:', error)
    } finally {
      setLoading(false)
    }
  }

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
    <IridescenceLayout>
      <NavbarEnhanced />
      <div className="flex max-w-[1400px] mx-auto">
        <Sidebar />
        <div className="flex-1 px-6 py-8">
          {/* Profile Content */}
          {isDoctor ? (
            <DoctorProfile />
          ) : (
            <>
              {/* Patient Profile Header */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center text-blue-700 font-bold text-2xl">
                    {user.avatar ? (
                      <img
                        src={getImageUrl(user.avatar) || ''}
                        alt={user.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.username?.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                    <p className="text-gray-600">Patient Profile</p>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Appointments</p>
                          <p className="text-2xl font-bold text-gray-900">
                            <CountUpNumber value={stats?.totalAppointments || 0} />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Upcoming</p>
                          <p className="text-2xl font-bold text-gray-900">
                            <CountUpNumber value={stats?.upcomingAppointments || 0} />
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">
                            <CountUpNumber value={stats?.completedAppointments || 0} />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Community Activity */}
                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Community Activity</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          <CountUpNumber value={stats?.totalPosts || 0} />
                        </p>
                        <p className="text-sm text-gray-600">Posts</p>
                      </div>

                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                          <MessageSquare className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          <CountUpNumber value={stats?.totalComments || 0} />
                        </p>
                        <p className="text-sm text-gray-600">Comments</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Link
                        href="/appointments"
                        className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                      >
                        <Calendar className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">My Appointments</p>
                          <p className="text-sm text-gray-600">View and manage appointments</p>
                        </div>
                      </Link>

                      <Link
                        href="/settings/profile"
                        className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                      >
                        <User className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Edit Profile</p>
                          <p className="text-sm text-gray-600">Update your information</p>
                        </div>
                      </Link>

                      <Link
                        href="/chat"
                        className="flex items-center gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                      >
                        <MessageSquare className="w-6 h-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Messages</p>
                          <p className="text-sm text-gray-600">Chat with doctors</p>
                        </div>
                      </Link>

                      <Link
                        href="/medications"
                        className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                      >
                        <Activity className="w-6 h-6 text-orange-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Medications</p>
                          <p className="text-sm text-gray-600">Track your medications</p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Member Since */}
                  {stats?.joinedDate && (
                    <div className="mt-6 text-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Member since {new Date(stats.joinedDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </IridescenceLayout>
  )
}
