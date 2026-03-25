'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useEffect, useState } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import IridescenceLayout from '@/components/IridescenceLayout'
import { MapPin, Phone, Clock, Star } from 'lucide-react'

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  distance: string
  rating: number
  specialties: string[]
  emergency: boolean
}

export default function FindHospitalsPage() {
  const { user } = useJWTAuth()
  const [hospitals, setHospitals] = useState<Hospital[]>([
    {
      id: '1',
      name: 'City General Hospital',
      address: '123 Main Street, Downtown',
      phone: '+1 234-567-8900',
      distance: '2.5 km',
      rating: 4.5,
      specialties: ['Emergency', 'Cardiology', 'Neurology'],
      emergency: true
    },
    {
      id: '2',
      name: 'St. Mary Medical Center',
      address: '456 Oak Avenue, Midtown',
      phone: '+1 234-567-8901',
      distance: '3.8 km',
      rating: 4.7,
      specialties: ['Pediatrics', 'Orthopedics', 'Oncology'],
      emergency: true
    },
    {
      id: '3',
      name: 'Community Health Clinic',
      address: '789 Pine Road, Suburb',
      phone: '+1 234-567-8902',
      distance: '5.2 km',
      rating: 4.2,
      specialties: ['General Medicine', 'Dermatology'],
      emergency: false
    }
  ])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    hospital.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (!user) {
    return (
      <IridescenceLayout>
        <div className="min-h-screen">
          <NavbarEnhanced />
          <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
            <Sidebar />
            <main className="flex-1 max-w-[800px]">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center shadow-soft">
                <p className="text-gray-600">Please log in to find hospitals</p>
              </div>
            </main>
          </div>
        </div>
      </IridescenceLayout>
    )
  }

  return (
    <IridescenceLayout>
      <div className="min-h-screen">
        <NavbarEnhanced />
        <div className="max-w-[1400px] mx-auto flex gap-6 pt-5 px-6">
          <Sidebar />
          <main className="flex-1 max-w-[800px]">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-4 shadow-soft">
              <h1 className="text-2xl font-bold text-charcoal mb-2">🏥 Find Hospitals</h1>
              <p className="text-sm text-gray-600 mb-4">Discover nearby hospitals and medical facilities</p>
              
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            
            <div className="space-y-4">
              {filteredHospitals.map(hospital => (
                <div
                  key={hospital.id}
                  className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-soft hover:shadow-lg transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-charcoal">{hospital.name}</h3>
                      {hospital.emergency && (
                        <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded">
                          24/7 Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{hospital.rating}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{hospital.address}</span>
                      <span className="ml-auto text-emerald-600 font-semibold">{hospital.distance}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{hospital.phone}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold">
                      Get Directions
                    </button>
                    <button className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-semibold">
                      Call Now
                    </button>
                  </div>
                </div>
              ))}

              {filteredHospitals.length === 0 && (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 text-center shadow-soft">
                  <p className="text-gray-600">No hospitals found matching your search</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </IridescenceLayout>
  )
}
