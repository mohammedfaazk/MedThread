'use client'

import { CheckCircle, Star } from 'lucide-react'

interface DoctorVerificationBadgeProps {
  doctorName: string
  specialty?: string
  reputationScore: number
  verificationStatus: string
}

export function DoctorVerificationBadge({
  doctorName,
  specialty,
  reputationScore,
  verificationStatus
}: DoctorVerificationBadgeProps) {
  if (verificationStatus !== 'VERIFIED') return null

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-md border-2 border-yellow-200 rounded-full shadow-soft">
      <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center">
        <CheckCircle className="w-4 h-4 text-charcoal" />
      </div>
      <div>
        <p className="text-sm font-semibold text-charcoal">{doctorName}</p>
        {specialty && <p className="text-xs text-gray-600">{specialty}</p>}
      </div>
      <span className="text-xs text-yellow-200 font-semibold ml-2 flex items-center gap-1">
        <Star className="w-3 h-3 fill-current" />
        {reputationScore}
      </span>
    </div>
  )
}
