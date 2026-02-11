'use client'

import { motion } from 'framer-motion'
import { MessageCircle, CheckCircle, ThumbsUp } from 'lucide-react'

interface ThreadCardProps {
  id: string
  patientUsername: string
  symptoms: string[]
  doctorResponseCount: number
  replyCount: number
  upvotes: number
}

export function ThreadCard({
  id,
  patientUsername,
  symptoms,
  doctorResponseCount,
  replyCount,
  upvotes
}: ThreadCardProps) {

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
      className="bg-white/40 backdrop-blur-md rounded-2xl p-6 shadow-soft cursor-pointer transition-all border border-white/20"
      onClick={() => window.location.href = `/thread/${id}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shadow-soft">
          <span className="text-charcoal font-semibold">
            {patientUsername[0].toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-semibold text-charcoal">{patientUsername}</p>
          <p className="text-sm text-gray-500">2 hours ago</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {symptoms.map((symptom, idx) => (
          <span
            key={idx}
            className="px-3 py-1 bg-yellow-50 text-charcoal rounded-full text-sm font-medium"
          >
            {symptom}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-6 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          {replyCount} replies
        </span>
        {doctorResponseCount > 0 && (
          <span className="flex items-center gap-1 text-yellow-200 font-semibold">
            <CheckCircle className="w-4 h-4" />
            {doctorResponseCount} doctor responses
          </span>
        )}
        <span className="flex items-center gap-1">
          <ThumbsUp className="w-4 h-4" />
          {upvotes}
        </span>
      </div>
    </motion.div>
  )
}
