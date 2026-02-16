'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  TrendingUp, AlertTriangle, Pill, Activity, 
  MapPin, Calendar, Download, RefreshCw, BarChart3
} from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function HealthInsightsPage() {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trending')

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${API_URL}/api/health-insights/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setInsights(response.data)
    } catch (error) {
      console.error('Error fetching insights:', error)
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Insights Dashboard</h1>
            <p className="text-gray-600">Real-time health trends and clinical intelligence</p>
          </div>
          <button
            onClick={fetchInsights}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              {['trending', 'regional', 'medications', 'diagnostics'].map(tab => (
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
            {activeTab === 'trending' && (
              <TrendingSymptomsTab symptoms={insights?.trendingSymptoms || []} />
            )}
            {activeTab === 'regional' && (
              <RegionalAlertsTab alerts={insights?.regionalAlerts || []} />
            )}
            {activeTab === 'medications' && (
              <MedicationPatternsTab patterns={insights?.medicationPatterns || []} />
            )}
            {activeTab === 'diagnostics' && (
              <DiagnosticPatternsTab patterns={insights?.diagnosticPatterns || []} />
            )}
          </div>
        </div>

        {/* Generated At */}
        <div className="text-center text-sm text-gray-500">
          Last updated: {insights?.generatedAt ? new Date(insights.generatedAt).toLocaleString() : 'N/A'}
        </div>
      </div>
    </div>
  )
}

function TrendingSymptomsTab({ symptoms }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Trending Symptoms</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {symptoms.length > 0 ? (
        symptoms.map((symptom: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className={`w-5 h-5 ${
                    symptom.growthRate > 75 ? 'text-red-600' :
                    symptom.growthRate > 40 ? 'text-orange-600' :
                    'text-green-600'
                  }`} />
                  <h4 className="font-medium text-gray-900">{symptom.title}</h4>
                </div>
                <p className="text-sm text-gray-600">{symptom.description}</p>
              </div>
              
              <div className="text-right ml-4">
                <p className={`text-2xl font-bold ${
                  symptom.growthRate > 75 ? 'text-red-600' :
                  symptom.growthRate > 40 ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  +{symptom.growthRate}%
                </p>
                <p className="text-sm text-gray-600">growth</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">{symptom.caseCount} cases</span>
              <span className="text-sm text-gray-600">{symptom.timeframe}</span>
              <span className={`px-2 py-1 rounded text-xs ${
                symptom.severity === 'critical' ? 'bg-red-100 text-red-700' :
                symptom.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                symptom.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {symptom.severity}
              </span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No trending symptoms data available</p>
      )}
    </div>
  )
}

function RegionalAlertsTab({ alerts }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Regional Health Alerts</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <MapPin className="w-4 h-4" />
          View Map
        </button>
      </div>

      {alerts.length > 0 ? (
        alerts.map((alert: any, index: number) => (
          <div key={index} className="p-4 border-l-4 rounded-lg bg-white shadow-sm" style={{
            borderLeftColor: alert.severity === 'high' ? '#ef4444' : '#f59e0b'
          }}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-1 ${
                alert.severity === 'high' ? 'text-red-600' : 'text-yellow-600'
              }`} />
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900">{alert.region}</h4>
                  <span className={`px-2 py-1 rounded text-xs ${
                    alert.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-2">{alert.alert}</p>
                <p className="text-sm text-gray-600">{alert.symptom} - {alert.caseCount} cases reported</p>
                
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No regional alerts at this time</p>
      )}
    </div>
  )
}

function MedicationPatternsTab({ patterns }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Medication Usage Patterns</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <BarChart3 className="w-4 h-4" />
          View Analytics
        </button>
      </div>

      {patterns.length > 0 ? (
        patterns.map((pattern: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Pill className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium text-gray-900">{pattern.medicationName}</h4>
                  <p className="text-sm text-gray-600">{pattern.mentionCount} mentions</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="text-center px-3 py-1 bg-green-50 rounded">
                  <p className="text-xs text-gray-600">Positive</p>
                  <p className="text-sm font-semibold text-green-700">{pattern.efficacy.positive}</p>
                </div>
                <div className="text-center px-3 py-1 bg-red-50 rounded">
                  <p className="text-xs text-gray-600">Negative</p>
                  <p className="text-sm font-semibold text-red-700">{pattern.efficacy.negative}</p>
                </div>
              </div>
            </div>
            
            {/* Side Effects */}
            {pattern.sideEffects.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">Common Side Effects:</p>
                <div className="flex flex-wrap gap-2">
                  {pattern.sideEffects.slice(0, 5).map((effect: any, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                      {effect.effect} ({effect.frequency})
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Common Conditions */}
            {pattern.commonConditions.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Used for:</p>
                <div className="flex flex-wrap gap-2">
                  {pattern.commonConditions.map((condition: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No medication patterns data available</p>
      )}
    </div>
  )
}

function DiagnosticPatternsTab({ patterns }: any) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Diagnostic Patterns & Common Misdiagnoses</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <Activity className="w-4 h-4" />
          View Details
        </button>
      </div>

      {patterns.length > 0 ? (
        patterns.map((pattern: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900 mb-1">Symptoms: {pattern.symptoms}</h4>
              <p className="text-sm text-gray-600">{pattern.caseCount} cases analyzed</p>
            </div>
            
            {pattern.commonMisdiagnoses && pattern.commonMisdiagnoses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Common Misdiagnosis Patterns:</p>
                {pattern.commonMisdiagnoses.map((misdiag: any, i: number) => (
                  <div key={i} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900">{misdiag.pattern}</p>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium">
                        {misdiag.count} cases
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-600 text-center py-8">No diagnostic patterns data available</p>
      )}
    </div>
  )
}
