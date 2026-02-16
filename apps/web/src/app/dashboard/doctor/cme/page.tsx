'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Award, TrendingUp, Calendar, Download, Trophy, 
  BookOpen, Target, Clock, CheckCircle2, Star
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function CmeDashboardPage() {
  const [cmeData, setC meData] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCmeData()
  }, [])

  const fetchCmeData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [cmeRes, leaderboardRes, opportunitiesRes] = await Promise.all([
        axios.get(`${API_URL}/api/cme-credits/my-credits`, { headers }),
        axios.get(`${API_URL}/api/cme-credits/leaderboard?timeframe=month&limit=10`),
        axios.get(`${API_URL}/api/cme-credits/opportunities`, { headers })
      ])

      setCmeData(cmeRes.data)
      setLeaderboard(leaderboardRes.data)
      setOpportunities(opportunitiesRes.data)
    } catch (error) {
      console.error('Error fetching CME data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCertificate = async (activityId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        `${API_URL}/api/cme-credits/certificate/${activityId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      alert('Certificate generated! Check your email.')
      console.log('Certificate:', response.data)
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Failed to generate certificate')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CME Credits Dashboard</h1>
          <p className="text-gray-600">Track your continuing medical education credits and achievements</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Award className="w-6 h-6" />}
            label="Total Credits"
            value={cmeData?.totalCredits || 0}
            color="blue"
            suffix=" CME"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="This Year"
            value={cmeData?.creditsThisYear || 0}
            color="green"
            suffix=" CME"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Verification"
            value={cmeData?.pendingVerifications || 0}
            color="yellow"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Rank"
            value="#12"
            color="purple"
          />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {['overview', 'activities', 'leaderboard', 'opportunities'].map(tab => (
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
              <OverviewTab cmeData={cmeData} />
            )}
            {activeTab === 'activities' && (
              <ActivitiesTab 
                activities={cmeData?.recentActivities || []} 
                onGenerateCertificate={generateCertificate}
              />
            )}
            {activeTab === 'leaderboard' && (
              <LeaderboardTab leaderboard={leaderboard} />
            )}
            {activeTab === 'opportunities' && (
              <OpportunitiesTab opportunities={opportunities} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color, suffix = '' }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-purple-50 text-purple-600'
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}{suffix}</p>
    </div>
  )
}

function OverviewTab({ cmeData }: any) {
  return (
    <div className="space-y-6">
      {/* Credits by Year */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Credits by Year</h3>
        <div className="space-y-2">
          {Object.entries(cmeData?.creditsByYear || {}).map(([year, credits]: any) => (
            <div key={year} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="font-medium">{year}</span>
              <span className="text-blue-600 font-semibold">{credits} CME</span>
            </div>
          ))}
        </div>
      </div>

      {/* Credits by Activity Type */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Credits by Activity Type</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(cmeData?.creditsByType || {}).map(([type, credits]: any) => (
            <div key={type} className="p-4 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{type.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-gray-900">{credits} CME</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivitiesTab({ activities, onGenerateCertificate }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
      {activities.length > 0 ? (
        activities.map((activity: any) => (
          <div key={activity.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{activity.activityTitle}</h4>
                <p className="text-sm text-gray-600 mt-1">{activity.activityDescription}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                {activity.creditsEarned} CME
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{new Date(activity.earnedAt).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  activity.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  activity.verificationStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {activity.verificationStatus}
                </span>
              </div>
              
              {activity.verificationStatus === 'APPROVED' && !activity.certificateGenerated && (
                <button
                  onClick={() => onGenerateCertificate(activity.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Download className="w-4 h-4" />
                  Generate Certificate
                </button>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No activities yet. Start earning CME credits!</p>
      )}
    </div>
  )
}

function LeaderboardTab({ leaderboard }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Top CME Earners This Month</h3>
      {leaderboard.map((doctor: any, index: number) => (
        <div key={doctor.doctorId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            index === 0 ? 'bg-yellow-100 text-yellow-700' :
            index === 1 ? 'bg-gray-100 text-gray-700' :
            index === 2 ? 'bg-orange-100 text-orange-700' :
            'bg-blue-50 text-blue-600'
          }`}>
            {index + 1}
          </div>
          
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-600">
            {doctor.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">Dr. {doctor.username}</h4>
            <p className="text-sm text-gray-600">{doctor.specialty}</p>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-600">{doctor.credits}</p>
            <p className="text-sm text-gray-600">CME Credits</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function OpportunitiesTab({ opportunities }: any) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Earn CME Credits Now</h3>
      {opportunities.length > 0 ? (
        opportunities.map((opp: any) => (
          <div key={opp.threadId} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{opp.title}</h4>
                <div className="flex items-center gap-2 mt-2">
                  {opp.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                +{opp.potentialCredits} CME
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{opp.replyCount} replies</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  opp.severity === 'HIGH' ? 'bg-red-100 text-red-700' :
                  opp.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {opp.severity}
                </span>
              </div>
              
              <a
                href={`/threads/${opp.threadId}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Answer Thread
              </a>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No opportunities available right now. Check back later!</p>
      )}
    </div>
  )
}
