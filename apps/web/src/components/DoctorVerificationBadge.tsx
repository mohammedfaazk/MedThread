'use client'

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
    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-orange-500 rounded-full">
      <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-bold">✓</span>
      </div>
      <div>
        <p className="text-sm font-semibold">{doctorName}</p>
        {specialty && <p className="text-xs text-gray-600">{specialty}</p>}
      </div>
      <span className="text-xs text-orange-600 font-semibold ml-2">
        ⭐ {reputationScore}
      </span>
    </div>
  )
}
