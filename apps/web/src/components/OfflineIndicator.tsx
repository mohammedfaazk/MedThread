'use client'

import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white py-2 px-4 text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      You're offline. Some features may be limited.
    </div>
  )
}
