'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Template({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Prefetch common routes for faster navigation
    const commonRoutes = [
      '/dashboard/patient',
      '/dashboard/doctor',
      '/chat',
      '/appointments',
      '/ai-detective',
      '/profile',
      '/settings'
    ]

    // Prefetch after a short delay to not block initial render
    const timer = setTimeout(() => {
      commonRoutes.forEach(route => {
        router.prefetch(route)
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return <>{children}</>
}
