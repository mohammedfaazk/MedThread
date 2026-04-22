'use client'

import { NavbarEnhanced } from '@/components/NavbarEnhanced'
import { Sidebar } from '@/components/Sidebar'
import { useEffect, useState, useRef } from 'react'
import { useJWTAuth } from '@/context/JWTAuthContext'
import IridescenceLayout from '@/components/IridescenceLayout'
import { MapPin, Phone, Star, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamically import map component to avoid SSR issues
const HospitalMap = dynamic(() => import('@/components/HospitalMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-xl flex items-center justify-center">
      <p className="text-gray-500">Loading map...</p>
    </div>
  )
})

interface Hospital {
  id: string
  name: string
  address: string
  phone: string
  distance: string
  rating: number
  specialties: string[]
  emergency: boolean
  lat: number
  lng: number
}

export default function FindHospitalsPage() {
  const { user } = useJWTAuth()
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pincode, setPincode] = useState('')
  const [searchRadius, setSearchRadius] = useState(5) // km

  // Fetch hospitals from OpenStreetMap Overpass API
  const fetchNearbyHospitals = async (lat: number, lng: number, radius: number = 5) => {
    setLoading(true)
    setError(null)
    
    try {
      // Overpass API query for hospitals within radius
      const radiusMeters = radius * 1000
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
          way["amenity"="hospital"](around:${radiusMeters},${lat},${lng});
          node["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
          way["amenity"="clinic"](around:${radiusMeters},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
      `
      
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      })

      if (!response.ok) throw new Error('Failed to fetch hospitals')

      const data = await response.json()
      
      // Process and format hospital data
      const hospitalData: Hospital[] = data.elements
        .filter((el: any) => el.tags && el.tags.name)
        .map((el: any, index: number) => {
          const hospitalLat = el.lat || el.center?.lat
          const hospitalLng = el.lon || el.center?.lon
          
          if (!hospitalLat || !hospitalLng) return null

          // Calculate distance
          const distance = calculateDistance(lat, lng, hospitalLat, hospitalLng)
          
          return {
            id: el.id.toString(),
            name: el.tags.name || 'Unnamed Hospital',
            address: formatAddress(el.tags),
            phone: el.tags.phone || el.tags['contact:phone'] || 'Not available',
            distance: `${distance.toFixed(1)} km`,
            rating: 4.0 + Math.random() * 0.9, // Random rating for demo
            specialties: extractSpecialties(el.tags),
            emergency: el.tags.emergency === 'yes' || el.tags.amenity === 'hospital',
            lat: hospitalLat,
            lng: hospitalLng
          }
        })
        .filter((h: Hospital | null) => h !== null)
        .sort((a: Hospital, b: Hospital) => parseFloat(a.distance) - parseFloat(b.distance))
        .slice(0, 50) // Limit to 50 nearest hospitals

      setHospitals(hospitalData)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching hospitals:', err)
      setError('Failed to load hospitals. Please try again.')
      setLoading(false)
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Format address from OSM tags
  const formatAddress = (tags: any): string => {
    const parts = []
    if (tags['addr:street']) parts.push(tags['addr:street'])
    if (tags['addr:city']) parts.push(tags['addr:city'])
    if (tags['addr:state']) parts.push(tags['addr:state'])
    if (tags['addr:postcode']) parts.push(tags['addr:postcode'])
    return parts.length > 0 ? parts.join(', ') : 'Address not available'
  }

  // Extract specialties from tags
  const extractSpecialties = (tags: any): string[] => {
    const specialties = []
    if (tags.emergency === 'yes') specialties.push('Emergency')
    if (tags.healthcare) specialties.push(tags.healthcare)
    if (tags['healthcare:speciality']) {
      specialties.push(...tags['healthcare:speciality'].split(';'))
    }
    return specialties.length > 0 ? specialties : ['General Medicine']
  }

  // Search by pincode
  const searchByPincode = async () => {
    if (!pincode || pincode.length < 6) {
      alert('Please enter a valid 6-digit pincode')
      return
    }

    setLoading(true)
    try {
      // Use Nominatim to geocode pincode
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`
      )
      const data = await response.json()
      
      if (data.length > 0) {
        const location = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
        setUserLocation(location)
        await fetchNearbyHospitals(location.lat, location.lng, searchRadius)
      } else {
        alert('Pincode not found. Please check and try again.')
        setLoading(false)
      }
    } catch (err) {
      console.error('Error searching pincode:', err)
      alert('Failed to search pincode. Please try again.')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(location)
          fetchNearbyHospitals(location.lat, location.lng, searchRadius)
        },
        (error) => {
          console.log('Location access denied, please enter pincode')
          // Default to India center (Delhi)
          const defaultLocation = { lat: 28.6139, lng: 77.2090 }
          setUserLocation(defaultLocation)
          setLoading(false)
        }
      )
    } else {
      const defaultLocation = { lat: 28.6139, lng: 77.2090 }
      setUserLocation(defaultLocation)
      setLoading(false)
    }
  }, [])

  const handleGetDirections = (hospital: Hospital) => {
    // Open Google Maps with directions
    const destination = `${hospital.lat},${hospital.lng}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
    window.open(url, '_blank')
  }

  const handleCallNow = (phone: string) => {
    // Trigger phone call
    window.location.href = `tel:${phone.replace(/[^0-9+]/g, '')}`
  }

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
              <p className="text-sm text-gray-600 mb-4">Discover nearby hospitals and medical facilities in India</p>
              
              {/* Pincode Search */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder="Enter your pincode (e.g., 560001)"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  maxLength={6}
                />
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={2}>2 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={20}>20 km</option>
                </select>
                <button
                  onClick={searchByPincode}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold"
                >
                  Search
                </button>
              </div>

              {/* Name/Specialty Search */}
              <input
                type="text"
                placeholder="Filter by name or specialty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Results Count */}
              {!loading && hospitals.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Showing {filteredHospitals.length} hospitals near your location
                </p>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-4 shadow-soft text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                <p className="text-gray-600">Loading nearby hospitals...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Map Section */}
            {!loading && hospitals.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-6 mb-4 shadow-soft">
                <h2 className="text-lg font-bold text-charcoal mb-3 flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                  Map View - {hospitals.length} Hospitals Found
                </h2>
                <HospitalMap 
                  hospitals={filteredHospitals} 
                  userLocation={userLocation}
                  selectedHospital={selectedHospital}
                  onHospitalSelect={setSelectedHospital}
                />
              </div>
            )}

            {/* No Results */}
            {!loading && hospitals.length === 0 && userLocation && (
              <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 p-8 mb-4 shadow-soft text-center">
                <p className="text-gray-600 mb-2">No hospitals found in this area</p>
                <p className="text-sm text-gray-500">Try increasing the search radius or enter a different pincode</p>
              </div>
            )}
            
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
                    <button 
                      onClick={() => handleGetDirections(hospital)}
                      className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </button>
                    <button 
                      onClick={() => handleCallNow(hospital.phone)}
                      className="flex-1 px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
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
