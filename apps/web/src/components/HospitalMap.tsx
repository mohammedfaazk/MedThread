'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

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

interface HospitalMapProps {
  hospitals: Hospital[]
  userLocation: { lat: number; lng: number } | null
  selectedHospital: Hospital | null
  onHospitalSelect: (hospital: Hospital | null) => void
}

export default function HospitalMap({ 
  hospitals, 
  userLocation, 
  selectedHospital,
  onHospitalSelect 
}: HospitalMapProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.Marker[]>([])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(
      userLocation ? [userLocation.lat, userLocation.lng] : [40.7580, -73.9855],
      13
    )

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add user location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })

      const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapRef.current)
        .bindPopup('<b>Your Location</b>')
      
      markersRef.current.push(userMarker)
    }

    // Add hospital markers
    hospitals.forEach(hospital => {
      const isSelected = selectedHospital?.id === hospital.id
      const isEmergency = hospital.emergency

      const hospitalIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div style="
            background: ${isEmergency ? '#ef4444' : '#10b981'}; 
            width: ${isSelected ? '36px' : '28px'}; 
            height: ${isSelected ? '36px' : '28px'}; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${isSelected ? '18px' : '14px'};
            transition: all 0.2s;
          ">
            🏥
          </div>
        `,
        iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
        iconAnchor: [isSelected ? 18 : 14, isSelected ? 18 : 14]
      })

      const marker = L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${hospital.name}</h3>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">${hospital.address}</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">📞 ${hospital.phone}</p>
            <p style="font-size: 12px; color: #666; margin-bottom: 8px;">⭐ ${hospital.rating} • ${hospital.distance}</p>
            ${isEmergency ? '<span style="background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">24/7 Emergency</span>' : ''}
          </div>
        `)
        .on('click', () => {
          onHospitalSelect(hospital)
        })

      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (hospitals.length > 0) {
      const bounds = L.latLngBounds(
        hospitals.map(h => [h.lat, h.lng])
      )
      if (userLocation) {
        bounds.extend([userLocation.lat, userLocation.lng])
      }
      mapRef.current.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [hospitals, userLocation, selectedHospital, onHospitalSelect])

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-[400px] rounded-xl overflow-hidden border border-gray-200"
      style={{ zIndex: 0 }}
    />
  )
}
