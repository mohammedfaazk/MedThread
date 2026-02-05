'use client'

import { Navbar } from '@/components/Navbar'
import { Sidebar } from '@/components/Sidebar'
import Link from 'next/link'

export default function DoctorsPage() {
  const doctors = [
    { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', reputation: 2450, username: 'dr_sarah_j', verified: true },
    { name: 'Dr. Michael Chen', specialty: 'Dermatology', reputation: 1890, username: 'dr_chen_derm', verified: true },
    { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', reputation: 1654, username: 'dr_emily_peds', verified: true },
    { name: 'Dr. James Wilson', specialty: 'Neurology', reputation: 1432, username: 'dr_wilson_neuro', verified: true },
    { name: 'Dr. Lisa Anderson', specialty: 'Orthopedics', reputation: 1289, username: 'dr_lisa_ortho', verified: true },
    { name: 'Dr. Robert Taylor', specialty: 'Psychiatry', reputation: 1156, username: 'dr_taylor_psych', verified: true },
    { name: 'Dr. Maria Garcia', specialty: 'Gastroenterology', reputation: 1089, username: 'dr_garcia_gi', verified: true },
    { name: 'Dr. David Lee', specialty: 'Oncology', reputation: 987, username: 'dr_lee_onc', verified: true },
  ]

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
            {doctors.map((doctor) => (
              <Link
                key={doctor.username}
                href={`/u/${doctor.username}`}
                className="bg-white rounded border border-gray-300 p-6 hover:border-gray-400 transition"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                    👨‍⚕️
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{doctor.name}</h3>
                      {doctor.verified && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{doctor.specialty}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-[#FF4500] font-semibold">⭐ {doctor.reputation} reputation</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}