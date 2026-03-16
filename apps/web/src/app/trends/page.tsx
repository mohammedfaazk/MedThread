'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useJWTAuth } from '@/context/JWTAuthContext'
import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import IridescenceLayout from '@/components/IridescenceLayout'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, TrendingUp, AlertTriangle, Users, RefreshCw, Info } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type Scope = 'area' | 'city' | 'district' | 'state' | 'country'
type TimeWindow = 'week' | 'month' | 'quarter'

interface SymptomEntry {
  symptom: string
  count: number
  intensity: number
  severity: { high: number; medium: number; low: number }
}

interface LocationInfo {
  pincode: string
  area: string
  city: string
  district: string
  state: string
  country: string
  scopeLabel: string
}

interface TrendsData {
  success: boolean
  location: LocationInfo
  scope: Scope
  period: string
  totalReports: number
  severityDistribution: { HIGH: number; MEDIUM: number; LOW: number }
  symptoms: SymptomEntry[]
  error?: string
}

const SCOPES: { key: Scope; label: string; icon: string }[] = [
  { key: 'area',     label: 'Area',     icon: '📍' },
  { key: 'city',     label: 'City',     icon: '🏙️' },
  { key: 'district', label: 'District', icon: '🗺️' },
  { key: 'state',    label: 'State',    icon: '🏛️' },
  { key: 'country',  label: 'Country',  icon: '🌏' },
]

const TIME_WINDOWS: { key: TimeWindow; label: string }[] = [
  { key: 'week',    label: 'Last 7 days' },
  { key: 'month',   label: 'Last 30 days' },
  { key: 'quarter', label: 'Last 90 days' },
]

// Heatmap colour based on intensity 0–100
function heatColor(intensity: number): string {
  if (intensity >= 70) return 'bg-red-500'
  if (intensity >= 50) return 'bg-orange-400'
  if (intensity >= 30) return 'bg-yellow-400'
  if (intensity >= 10) return 'bg-green-400'
  return 'bg-blue-300'
}

function heatTextColor(intensity: number): string {
  if (intensity >= 30) return 'text-white'
  return 'text-gray-800'
}

export default function TrendsPage() {
  const { user, role, loading } = useJWTAuth()
  const router = useRouter()

  const [scope, setScope] = useState<Scope>('city')
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('month')
  const [data, setData] = useState<TrendsData | null>(null)
  const [fetching, setFetching] = useState(false)
  const [noPincode, setNoPincode] = useState(false)

  useEffect(() => {
    if (!loading && (!user || role !== 'PATIENT')) router.push('/')
  }, [user, role, loading, router])

  const fetchTrends = useCallback(async () => {
    if (!user) return
    const pincode = user.pincode
    if (!pincode) {
      // Use setTimeout to avoid setState-during-render warning
      setTimeout(() => setNoPincode(true), 0)
      return
    }

    setFetching(true)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(
        `${API_URL}/api/regional-symptom-analytics/by-pincode?pincode=${pincode}&scope=${scope}&timeWindow=${timeWindow}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error('Failed to fetch trends:', e)
    } finally {
      setFetching(false)
    }
  }, [user, scope, timeWindow])

  useEffect(() => {
    if (user && role === 'PATIENT') fetchTrends()
  }, [fetchTrends, user, role])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <NavbarEnhanced />

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Symptom Trends</h1>
                <p className="text-sm text-gray-500">Regional health patterns based on patient posts near you</p>
              </div>
            </div>

            {data?.location && (
              <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span>
                  Your location: <span className="font-semibold text-gray-800">{data.location.area}</span>
                  {' · '}{data.location.city}{' · '}{data.location.district}
                  {' · '}{data.location.state}{' · '}{data.location.country}
                </span>
              </div>
            )}
          </motion.div>

          {noPincode ? (
            <NoPincodePrompt />
          ) : (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Scope toggle */}
                <div className="flex bg-white/70 backdrop-blur rounded-xl border border-white/20 p-1 gap-1 shadow-sm flex-wrap">
                  {SCOPES.map(s => (
                    <button
                      key={s.key}
                      onClick={() => setScope(s.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        scope === s.key
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                      }`}
                    >
                      <span>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>

                {/* Time window */}
                <div className="flex bg-white/70 backdrop-blur rounded-xl border border-white/20 p-1 gap-1 shadow-sm ml-auto">
                  {TIME_WINDOWS.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setTimeWindow(t.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        timeWindow === t.key
                          ? 'bg-gray-800 text-white shadow-sm'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-white/60'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={fetchTrends}
                  disabled={fetching}
                  className="p-2 rounded-xl bg-white/70 border border-white/20 shadow-sm hover:bg-white/90 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${fetching ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {/* Scope label */}
              {data?.location && (
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-sm text-gray-500">Showing trends for:</span>
                  <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold">
                    {data.location.scopeLabel}
                  </span>
                  <span className="text-xs text-gray-400">· {data.period}</span>
                </div>
              )}

              {fetching ? (
                <LoadingSkeleton />
              ) : data ? (
                data.success === false ? (
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-10 text-center">
                    <AlertTriangle className="w-10 h-10 text-orange-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium">{data.error || 'Could not load trend data.'}</p>
                    <button onClick={fetchTrends} className="mt-4 px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors">
                      Retry
                    </button>
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${scope}-${timeWindow}`}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {/* Summary stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <StatCard label="Total Reports" value={data.totalReports ?? 0} icon={<Users className="w-4 h-4" />} color="blue" />
                        <StatCard label="Unique Symptoms" value={data.symptoms?.length ?? 0} icon={<TrendingUp className="w-4 h-4" />} color="purple" />
                        <StatCard label="High Severity" value={data.severityDistribution?.HIGH ?? 0} icon={<AlertTriangle className="w-4 h-4" />} color="red" />
                        <StatCard label="Low Severity" value={data.severityDistribution?.LOW ?? 0} icon={<Info className="w-4 h-4" />} color="green" />
                      </div>

                      {(data.symptoms?.length ?? 0) === 0 ? (
                        <EmptyState scope={scope} scopeLabel={data.location?.scopeLabel} />
                      ) : (
                        <>
                          {/* Heatmap grid */}
                          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6 mb-6">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">Symptom Heatmap</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {(data.symptoms ?? []).map((s, i) => (
                                <motion.div
                                  key={s.symptom}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.03 }}
                                  className={`rounded-xl p-3 ${heatColor(s.intensity)} ${heatTextColor(s.intensity)} relative overflow-hidden`}
                                  title={`${s.count} reports · High: ${s.severity.high} · Med: ${s.severity.medium} · Low: ${s.severity.low}`}
                                >
                                  <div
                                    className="absolute bottom-0 left-0 h-1 bg-black/20 rounded-b-xl"
                                    style={{ width: `${s.intensity}%` }}
                                  />
                                  <p className="font-semibold text-sm capitalize leading-tight">{s.symptom}</p>
                                  <p className="text-xs opacity-80 mt-0.5">{s.count} report{s.count !== 1 ? 's' : ''}</p>
                                  <div className="flex gap-1.5 mt-1.5 text-[10px] opacity-70">
                                    <span>🔴{s.severity.high}</span>
                                    <span>🟡{s.severity.medium}</span>
                                    <span>🟢{s.severity.low}</span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>

                            {/* Legend */}
                            <div className="flex items-center gap-3 mt-5 flex-wrap">
                              <span className="text-xs text-gray-500 font-medium">Intensity:</span>
                              {[
                                { color: 'bg-blue-300', label: 'Very Low' },
                                { color: 'bg-green-400', label: 'Low' },
                                { color: 'bg-yellow-400', label: 'Moderate' },
                                { color: 'bg-orange-400', label: 'High' },
                                { color: 'bg-red-500', label: 'Critical' },
                              ].map(l => (
                                <div key={l.label} className="flex items-center gap-1">
                                  <div className={`w-3 h-3 rounded ${l.color}`} />
                                  <span className="text-xs text-gray-500">{l.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Top ranked list */}
                          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-6">
                            <h2 className="text-base font-semibold text-gray-800 mb-4">Top Reported Symptoms</h2>
                            <div className="space-y-3">
                              {(data.symptoms ?? []).slice(0, 8).map((s, i) => (
                                <div key={s.symptom} className="flex items-center gap-3">
                                  <span className="w-6 text-xs font-bold text-gray-400 text-right">{i + 1}</span>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium text-gray-800 capitalize">{s.symptom}</span>
                                      <span className="text-xs text-gray-500">{s.count} reports</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${s.intensity}%` }}
                                        transition={{ duration: 0.6, delay: i * 0.05 }}
                                        className={`h-full rounded-full ${heatColor(s.intensity)}`}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )
              ) : null}
            </>
          )}
        </div>
      </div>
    </IridescenceLayout>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-50 to-cyan-50 text-blue-600',
    purple: 'from-purple-50 to-pink-50 text-purple-600',
    red: 'from-red-50 to-orange-50 text-red-600',
    green: 'from-green-50 to-emerald-50 text-green-600',
  }
  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function NoPincodePrompt() {
  const router = useRouter()
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-10 text-center">
      <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No pincode on your profile</h3>
      <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
        Add your pincode to your profile so we can show symptom trends in your area.
      </p>
      <button
        onClick={() => router.push('/profile')}
        className="px-6 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
      >
        Update Profile
      </button>
    </div>
  )
}

function EmptyState({ scope, scopeLabel }: { scope: Scope; scopeLabel?: string }) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg p-10 text-center">
      <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No symptom data yet</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto">
        No symptom reports found for <span className="font-medium">{scopeLabel}</span> in this time period.
        Try a wider scope or longer time window.
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/50 rounded-xl" />)}
      </div>
      <div className="h-64 bg-white/50 rounded-2xl" />
      <div className="h-48 bg-white/50 rounded-2xl" />
    </div>
  )
}
