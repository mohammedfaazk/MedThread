'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'
import axios from 'axios'
import { Stethoscope, MapPin, Award, TrendingUp } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Doctor {
  id: string
  username: string
  specialty?: string
  yearsOfExperience?: number
  hospitalAffiliation?: string
  pincode?: string
  area?: string
  totalKarma: number
  postCount?: number
  helpfulReplies?: number
  avatar?: string
}

export default function TopDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'overall' | 'region'>('overall')
  const [selectedPincode, setSelectedPincode] = useState('')
  const [availablePincodes, setAvailablePincodes] = useState<string[]>([])

  useEffect(() => {
    fetchDoctors()
  }, [viewMode, selectedPincode])

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      let url = `${API_URL}/api/v1/doctors/top`
      
      if (viewMode === 'region' && selectedPincode) {
        url = `${API_URL}/api/v1/doctors/top-by-area?pincode=${selectedPincode}`
      }

      const response = await axios.get(url)
      const doctorsData = response.data?.data?.doctors || response.data?.doctors || []
      
      setDoctors(doctorsData)
      
      // Extract unique pincodes for filter
      const pincodes = [...new Set(doctorsData.map((d: Doctor) => d.pincode).filter(Boolean))]
      setAvailablePincodes(pincodes as string[])
    } catch (error) {
      console.error('Failed to fetch top doctors:', error)
      setDoctors([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Award className="w-10 h-10 text-yellow-500" />
            Top Doctors
          </h1>
          <p className="text-gray-600">
            Discover the most helpful and highly-rated doctors in our community
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setViewMode('overall')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === 'overall'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Overall Rankings
              </div>
            </button>
            <button
              onClick={() => setViewMode('region')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                viewMode === 'region'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                By Region
              </div>
            </button>
          </div>

          {/* Region Filter */}
          {viewMode === 'region' && (
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-700">Filter by Pincode:</label>
              <select
                value={selectedPincode}
                onChange={(e) => setSelectedPincode(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Regions</option>
                {availablePincodes.map((pincode) => (
                  <option key={pincode} value={pincode}>
                    {pincode}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Doctors List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading top doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-12 shadow-lg text-center">
            <p className="text-gray-600">No doctors found for the selected criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {doctors.map((doctor, index) => (
              <Link
                key={doctor.id}
                href={`/u/${doctor.username}`}
                className="block bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all hover:border-white/40"
              >
                <div className="flex items-center gap-6">
                  {/* Rank Badge */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                    index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-700' :
                    index === 2 ? 'bg-orange-400 text-orange-900' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>

                  {/* Avatar */}
                  <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {doctor.avatar ? (
                      <img src={doctor.avatar} alt={doctor.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      doctor.username[0].toUpperCase()
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Dr. {doctor.username}
                      </h3>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      {doctor.specialty && (
                        <div className="flex items-center gap-1">
                          <Stethoscope className="w-4 h-4" />
                          <span className="font-semibold">{doctor.specialty}</span>
                        </div>
                      )}
                      {doctor.yearsOfExperience && (
                        <div>
                          <span className="font-semibold">{doctor.yearsOfExperience}</span> years experience
                        </div>
                      )}
                      {doctor.hospitalAffiliation && (
                        <div>
                          🏥 {doctor.hospitalAffiliation}
                        </div>
                      )}
                      {doctor.pincode && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {doctor.pincode}
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6 text-sm">
                      <div className="px-3 py-1 bg-blue-50 rounded-lg">
                        <span className="font-bold text-blue-700">{doctor.totalKarma}</span>
                        <span className="text-gray-600 ml-1">Karma</span>
                      </div>
                      {doctor.postCount !== undefined && (
                        <div className="px-3 py-1 bg-purple-50 rounded-lg">
                          <span className="font-bold text-purple-700">{doctor.postCount}</span>
                          <span className="text-gray-600 ml-1">Posts</span>
                        </div>
                      )}
                      {doctor.helpfulReplies !== undefined && (
                        <div className="px-3 py-1 bg-green-50 rounded-lg">
                          <span className="font-bold text-green-700">{doctor.helpfulReplies}</span>
                          <span className="text-gray-600 ml-1">Helpful Replies</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
