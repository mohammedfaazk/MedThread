'use client'

export function EmergencyBanner() {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">🚨</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-700 mb-2">
            Emergency Warning Detected
          </h3>
          <p className="text-red-600 mb-4">
            Your symptoms may indicate a medical emergency. Please seek immediate medical attention.
          </p>
          <div className="flex gap-3">
            <button className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition font-semibold">
              Call Emergency Services
            </button>
            <button className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-full hover:bg-red-50 transition font-semibold">
              Find Nearest Hospital
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
