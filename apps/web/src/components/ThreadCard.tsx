'use client'

import { motion } from 'framer-motion'

interface ThreadCardProps {
  id: string
  patientUsername: string
  symptoms: string[]
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY'
  doctorResponseCount: number
  replyCount: number
  upvotes: number
}

export function ThreadCard({
  id,
  patientUsername,
  symptoms,
  severity,
  doctorResponseCount,
  replyCount,
  upvotes
}: ThreadCardProps) {
  const severityColors = {
    LOW: 'bg-blue-100 text-blue-700',
    MODERATE: 'bg-yellow-100 text-yellow-700',
    HIGH: 'bg-orange-100 text-orange-700',
    EMERGENCY: 'bg-red-100 text-red-700'
  }

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)' }}
      className="bg-white rounded-2xl p-6 shadow-sm cursor-pointer transition-all"
      onClick={() => window.location.href = `/thread/${id}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 font-semibold">
            {patientUsername[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold">{patientUsername}</p>
          <p className="text-sm text-gray-500">2 hours ago</p>
        </div>
        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${severityColors[severity]}`}>
          {severity}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {symptoms.map((symptom, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm font-medium"
          >
            {symptom}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          💬 {replyCount} replies
        </span>
        {doctorResponseCount > 0 && (
          <span className="flex items-center gap-1 text-orange-600 font-semibold">
            ✓ {doctorResponseCount} doctor responses
          </span>
        )}
        <span className="flex items-center gap-1">
          👍 {upvotes}
        </span>
      </div>
    </motion.div>
  )
}
