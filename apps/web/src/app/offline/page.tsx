'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()

  const handleRetry = () => {
    if (navigator.onLine) {
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f6e3af] to-[#7dc2f1] p-4">
      <div className="max-w-md w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
          <WifiOff className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          It looks like you've lost your internet connection. Check your network settings and try again.
        </p>

        <button
          onClick={handleRetry}
          className="w-full bg-gradient-to-r from-[#5CB8B2] to-[#4DA9A3] text-white py-3 px-6 rounded-2xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Try Again
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Some features may be available offline. Your actions will sync when you're back online.
          </p>
        </div>
      </div>
    </div>
  )
}
