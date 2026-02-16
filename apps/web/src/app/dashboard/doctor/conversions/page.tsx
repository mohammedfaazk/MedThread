'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { TrendingUp, Users, DollarSign, Calendar, Target, Clock, Award } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function ConversionDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [topThreads, setTopThreads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('month')

  useEffect(() => {
    fetchData()
  }, [timeframe])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }

      const [metricsRes, threadsRes] = await Promise.all([
        axios.get(`${API_URL}/api/consultation-funnel/metrics?timeframe=${timeframe}`, { headers }),
        axios.get(`${API_URL}/api/consultation-funnel/top-threads?limit=10`, { headers })
      ])

      setMetrics(metricsRes.data)
      setTopThreads(threadsRes.data)
    } catch (error) {
      console.error('Error fetching conversion data:', error)
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Conversion Dashboard</h1>
            <p className="text-gray-600">Track your consultation funnel performance</p>
          </div>
          
          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {['week', 'month', 'all'].map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeframe === tf
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {tf.charAt(0).toUpperCase() + tf.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Users className="w-6 h-6" />}
            label="Total Inquiries"
            value={metrics?.totalInquiries || 0}
            color="blue"
          />
          <MetricCard
            icon={<Calendar className="w-6 h-6" />}
            label="Appointments Scheduled"
            value={metrics?.appointmentsScheduled || 0}
            color="green"
          />
          <MetricCard
            icon={<Target className="w-6 h-6" />}
            label="Conversion Rate"
            value={`${metrics?.conversionRate || 0}%`}
            color="purple"
          />
          <MetricCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Revenue"
            value={`$${metrics?.revenue || 0}`}
            color="yellow"
          />
        </div>

        {/* Funnel Visualization */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Consultation Funnel</h2>
          
          <div className="space-y-4">
            <FunnelStage
              label="Inquiries Sent"
              value={metrics?.totalInquiries || 0}
              percentage={100}
              color="blue"
            />
            <FunnelStage
              label="Doctor Responses"
              value={metrics?.doctorResponses || 0}
              percentage={metrics?.totalInquiries ? (metrics.doctorResponses / metrics.totalInquiries) * 100 : 0}
              color="indigo"
            />
            <FunnelStage
              label="Appointments Requested"
              value={metrics?.appointmentsRequested || 0}
              percentage={metrics?.totalInquiries ? (metrics.appointmentsRequested / metrics.totalInquiries) * 100 : 0}
              color="purple"
            />
            <FunnelStage
              label="Appointments Scheduled"
              value={metrics?.appointmentsScheduled || 0}
              percentage={metrics?.totalInquiries ? (metrics.appointmentsScheduled / metrics.totalInquiries) * 100 : 0}
              color="green"
            />
            <FunnelStage
              label="Consultations Completed"
              value={metrics?.consultationsCompleted || 0}
              percentage={metrics?.totalInquiries ? (metrics.consultationsCompleted / metrics.totalInquiries) * 100 : 0}
              color="emerald"
            />
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Average Time to Conversion
            </h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {metrics?.averageTimeToConversion || 0} hours
            </div>
            <p className="text-sm text-gray-600">
              From inquiry to scheduled appointment
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Response Rate
            </h3>
            <div className="text-4xl font-bold text-green-600 mb-2">
              {metrics?.totalInquiries ? Math.round((metrics.doctorResponses / metrics.totalInquiries) * 100) : 0}%
            </div>
            <p className="text-sm text-gray-600">
              Inquiries you responded to
            </p>
          </div>
        </div>

        {/* Top Converting Threads */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Converting Threads</h2>
          
          {topThreads.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No conversion data available yet</p>
          ) : (
            <div className="space-y-4">
              {topThreads.map((thread, index) => (
                <div key={thread.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{thread.title}</h4>
                    <div className="flex items-center gap-2">
                      {thread.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">{thread.conversions}</div>
                    <div className="text-sm text-gray-600">conversions</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon, label, value, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
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

function FunnelStage({ label, value, percentage, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    emerald: 'bg-emerald-600'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-600">{value} ({Math.round(percentage)}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${colorClasses[color as keyof typeof colorClasses]}`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  )
}
