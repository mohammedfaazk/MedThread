'use client'

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
      className={`rounded-2xl p-6 ${
        isDoctor
          ? 'bg-orange-50 border-2 border-orange-200'
          : 'bg-white border border-gray-200'
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isDoctor ? 'bg-orange-500' : 'bg-gray-300'
        }`}>
          <span className="text-white font-semibold">
            {authorName[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-semibold">{authorName}</p>
          {isDoctorVerified && (
            <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-medium">
              ✓ Verified Doctor
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500">2h ago</span>
      </div>

      <p className="text-gray-700 leading-relaxed mb-4">{content}</p>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition">
          <span>👍</span>
          <span>{helpfulCount} helpful</span>
        </button>
        <button className="text-sm text-gray-600 hover:text-orange-600 transition">
          Reply
        </button>
      </div>
    </div>
  )
}
