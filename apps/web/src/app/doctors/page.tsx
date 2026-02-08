'use client'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')

      if (data && data.length > 0) {
        setDoctors(data);
      } else {
        // Fallback to mock doctor data if DB is empty
        console.log('[UI] Supabase doctors directory empty, using fallback');
        setDoctors([
          {
            id: "7f6b352f-961c-44aa-be98-fcc5debd10c8",
            user_id: "9d8480d1-b32d-4290-b9f3-a7b23bb9c2f4",
            full_name: "Dr. John Doe M",
            specialization: "Cardiologist",
            reputation_score: 1500,
            is_verified: true
          }
        ]);
      }
      if (error) console.error('Error fetching doctors:', error)
    } catch (error) {
      console.error('Catch error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Loading doctors...</div>

  return (
    <div className="min-h-screen bg-[#DAE0E6]">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[900px]">
          <div className="bg-white rounded border border-gray-300 p-6 mb-4">
            <h1 className="text-3xl font-bold mb-2">Verified Doctors</h1>
            <p className="text-gray-600">Connect with verified healthcare professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => {
              const displayUsername = doctor.id; // Use id as fallback for username
              const displayName = doctor.full_name || `Dr. Professional`;

              return (
                <Link
                  key={doctor.id}
                  href={`/u/${displayUsername}`}
                  className="bg-white rounded border border-gray-300 p-6 hover:border-gray-400 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                      👨‍⚕️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{displayName}</h3>
                        {doctor.is_verified && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{doctor.specialization || 'Medical Professional'}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-[#FF4500] font-semibold">⭐ {doctor.reputation_score || 0} reputation</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </main>
      </div>
    </div>
  )
}