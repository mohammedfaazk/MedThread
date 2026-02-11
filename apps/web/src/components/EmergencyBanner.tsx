'use client'

import { AlertTriangle, Phone, MapPin } from 'lucide-react'

export function EmergencyBanner() {
  return (
    <div className="bg-red-50/80 backdrop-blur-md border-2 border-red-300/50 p-6 mb-6 shadow-elevated rounded-2xl">
      <div className="flex items-start gap-4">
        <div className="text-red-600">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-700 mb-2">
            Emergency Warning Detected
          </h3>
          <p className="text-red-600 mb-4">
            Your symptoms may indicate a medical emergency. Please seek immediate medical attention.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold shadow-soft hover:shadow-elevated flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Call Emergency Services
            </button>
            <button className="px-6 py-2.5 border-2 border-red-600 text-red-600 rounded-full hover:bg-red-50 transition font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Find Nearest Hospital
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
