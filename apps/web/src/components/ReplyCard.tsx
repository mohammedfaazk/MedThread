'use client'

import { ThumbsUp, CheckCircle } from 'lucide-react'

interface ReplyCardProps {
  authorName: string
  authorRole: string
  content: string
  isDoctorVerified: boolean
  helpfulCount: number
}

export function ReplyCard({
  authorName,
  authorRole,
  content,
  isDoctorVerified,
  helpfulCount
}: ReplyCardProps) {
  const isDoctor = authorRole === 'VERIFIED_DOCTOR'

  return (
    <div
      className={`rounded-2xl p-6 shadow-soft border transition-all ${
        isDoctor
          ? 'bg-yellow-50/80 backdrop-blur-md border-yellow-200/50'
          : 'bg-white/80 backdrop-blur-md border-white/20'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-soft ${
          isDoctor ? 'bg-yellow-200' : 'bg-gray-300'
        }`}>
          <span className={`font-semibold ${isDoctor ? 'text-charcoal' : 'text-white'}`}>
            {authorName[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold text-charcoal">{authorName}</p>
          {isDoctorVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-yellow-200 font-medium">
              <CheckCircle className="w-3 h-3" />
              Verified Doctor
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">2h ago</span>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">{content}</p>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-yellow-200 transition">
          <ThumbsUp className="w-4 h-4" />
          <span>{helpfulCount} helpful</span>
        </button>
        <button className="text-sm text-gray-600 hover:text-yellow-200 transition">
          Reply
        </button>
      </div>
    </div>
  )
}
