'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { 
  CheckCircle2, Calendar, TrendingUp, Award, BookOpen, 
  Users, Clock, Target, Star, MapPin, Phone, Globe,
  Briefcase, GraduationCap, FileText, Trophy
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DoctorProfilePage() {
  const params = useParams()
  const username = params.username as string
  
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchDoctorProfile()
  }, [username])

  const fetchDoctorProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doctor-profile/${username}`)
      setProfile(response.data)
    } catch (error) {
      console.error('Error fetching doctor profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Not Found</h2>
          <p className="text-gray-600">The doctor profile you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const { profile: doctor, metrics, stats, topConditions, recentActivity } = profile

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-blue-600 shadow-lg">
              {doctor.username.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">Dr. {doctor.username}</h1>
                {doctor.doctorVerificationStatus === 'APPROVED' && (
                  <CheckCircle2 className="w-8 h-8 text-blue-300 fill-blue-300/20" />
                )}
              </div>
              
              <p className="text-xl text-blue-100 mb-4">
                {doctor.specialty}
                {doctor.subSpecialty && ` • ${doctor.subSpecialty}`}
              </p>

              <div className="flex flex-wrap gap-4 text-sm">
                {doctor.yearsOfExperience && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    <span>{doctor.yearsOfExperience} years experience</span>
                  </div>
                )}
                {doctor.hospitalAffiliation && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{doctor.hospitalAffiliation}</span>
                  </div>
                )}
                {doctor.medicalLicenseNumber && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>License: {doctor.medicalLicenseNumber}</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <button className="mt-6 px-8 py-3 bg-white text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition flex items-center gap-2 shadow-lg">
                <Calendar className="w-5 h-5" />
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            label="Case Resolution Rate"
            value={`${metrics.caseResolutionRate}%`}
            color="blue"
          />
          <MetricCard
            icon={<Star className="w-6 h-6" />}
            label="Patient Satisfaction"
            value={metrics.averagePatientSatisfaction > 0 ? `${metrics.averagePatientSatisfaction}/5` : 'N/A'}
            color="yellow"
          />
          <MetricCard
            icon={<Clock className="w-6 h-6" />}
            label="Avg Response Time"
            value={`${metrics.averageResponseTime} min`}
            color="green"
          />
          <MetricCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Specialization Depth"
            value={`${metrics.specializationDepthScore}/100`}
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {['overview', 'credentials', 'activity', 'reviews'].map(tab => (
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
            {activeTab === 'overview' && (
              <OverviewTab 
                doctor={doctor} 
                stats={stats} 
                topConditions={topConditions}
              />
            )}
            {activeTab === 'credentials' && (
              <CredentialsTab doctor={doctor} />
            )}
            {activeTab === 'activity' && (
              <ActivityTab recentActivity={recentActivity} />
            )}
            {activeTab === 'reviews' && (
              <ReviewsTab doctorId={doctor.id} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}

function OverviewTab({ doctor, stats, topConditions }: any) {
  return (
    <div className="space-y-6">
      {/* Bio */}
      {doctor.bio && (
        <div>
          <h3 className="text-lg font-semibold mb-2">About</h3>
          <p className="text-gray-700">{doctor.bio}</p>
        </div>
      )}

      {/* Contribution Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Contribution Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <StatBox
            label="Total Cases Handled"
            value={stats.totalCasesHandled}
            icon={<Users className="w-5 h-5" />}
          />
          <StatBox
            label="Emergency Flags Detected"
            value={stats.emergencyFlagsDetected}
            icon={<Award className="w-5 h-5" />}
          />
          <StatBox
            label="Monthly Streak"
            value={`${stats.monthlyContributionStreak} months`}
            icon={<TrendingUp className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Top Conditions */}
      {topConditions && topConditions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Top Conditions Answered</h3>
          <div className="space-y-2">
            {topConditions.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{item.condition}</span>
                <span className="text-sm text-gray-600">{item.count} cases</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CredentialsTab({ doctor }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          Education
        </h3>
        <p className="text-gray-600">Education details will be displayed here</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Certifications
        </h3>
        <p className="text-gray-600">Certifications will be displayed here</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Publications
        </h3>
        <p className="text-gray-600">Publications will be displayed here</p>
      </div>
    </div>
  )
}

function ActivityTab({ recentActivity }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      {recentActivity && recentActivity.length > 0 ? (
        recentActivity.map((activity: any) => (
          <div key={activity.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{activity.thread.title}</h4>
                <p className="text-sm text-gray-600">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </p>
              </div>
              {activity.thread.isResolved && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Resolved
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No recent activity</p>
      )}
    </div>
  )
}

function ReviewsTab({ doctorId }: any) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Patient Reviews</h3>
      <p className="text-gray-600">Reviews will be displayed here</p>
    </div>
  )
}

function StatBox({ label, value, icon }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-2 mb-2 text-gray-600">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
