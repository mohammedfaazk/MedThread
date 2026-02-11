'use client'
import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import axios from 'axios'

import { Stethoscope } from 'lucide-react'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      // First, try to fetch approved doctors from our API
      console.log('[Doctors Page] Fetching verified doctors from API...');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API_URL}/api/v1/doctor-verification/verified`);
      
      console.log('[Doctors Page] API Response:', response.data);
      // API returns { success: true, data: { doctors: [...], pagination: {...} } }
      const doctorsList = response.data?.data?.doctors || response.data?.doctors || [];
      
      if (doctorsList.length > 0) {
        console.log(`[Doctors Page] Found ${doctorsList.length} verified doctors from API`);
        // Sort by reputation_score (highest to lowest)
        const sortedDoctors = doctorsList.sort((a: any, b: any) => (b.reputation_score || 0) - (a.reputation_score || 0));
        setDoctors(sortedDoctors);
        setLoading(false);
        return;
      }

      // Fallback to Supabase
      console.log('[Doctors Page] No verified doctors in API, checking Supabase...');
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('reputation_score', { ascending: false })

      if (data && data.length > 0) {
        console.log(`[Doctors Page] Found ${data.length} doctors in Supabase`);
        setDoctors(data);
      } else {
        // Fallback to doctor_data.json if DB is empty
        console.log('[Doctors Page] Supabase doctors directory empty, loading from doctor_data.json');
        try {
          const jsonResponse = await fetch('/doctor_data.json');
          if (jsonResponse.ok) {
            const doctorData = await jsonResponse.json();
            // Sort by reputation_score
            const sortedDoctors = doctorData.sort((a: any, b: any) => (b.reputation_score || 0) - (a.reputation_score || 0));
            setDoctors(sortedDoctors);
          } else {
            console.warn('[Doctors Page] Failed to load doctor_data.json');
          }
        } catch (jsonError) {
          console.error('[Doctors Page] Error loading doctor_data.json:', jsonError);
        }
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
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
        <Sidebar />
        <main className="flex-1 max-w-[900px]">
          <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 mb-4 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Verified Doctors</h1>
            <p className="text-gray-600">Connect with verified healthcare professionals</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doctor) => {
              // Use id for link
              const doctorLinkId = doctor.id;
              const displayName = doctor.name || doctor.full_name || doctor.username || `Dr. ${doctor.email?.split('@')[0]}`;
              const specialty = doctor.specialization || doctor.specialty || 'Medical Professional';
              const experience = doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years exp.` : '';
              const reputation = doctor.reputation_score || 0;

              return (
                <Link
                  key={doctor.id}
                  href={`/u/${doctorLinkId}`}
                  className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:border-white/40 hover:shadow-xl transition-all shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg">{displayName}</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{specialty}</p>
                      {doctor.subSpecialty && (
                        <p className="text-gray-500 text-xs mb-2">Subspecialty: {doctor.subSpecialty}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        {experience && (
                          <span className="text-blue-600 font-semibold">📅 {experience}</span>
                        )}
                        <span className="text-[#FF4500] font-semibold">⭐ {reputation}</span>
                      </div>
                      {doctor.hospitalAffiliation && (
                        <p className="text-xs text-gray-500 mt-2">🏥 {doctor.hospitalAffiliation}</p>
                      )}
                      {doctor.verifiedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          Verified on {new Date(doctor.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {doctors.length === 0 && !loading && (
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl border border-white/20 p-12 text-center shadow-lg">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-12 h-12 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Verified Doctors Yet</h3>
              <p className="text-gray-600">Check back soon as we verify more healthcare professionals.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}